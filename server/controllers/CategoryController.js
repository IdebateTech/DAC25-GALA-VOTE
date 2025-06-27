export class CategoryController {
  constructor(db, io) {
    this.db = db;
    this.io = io;
  }

  async getCategories(req, res) {
    try {
      const categories = await this.db.db.all(`
        SELECT c.*, 
               COUNT(n.id) as nominee_count
        FROM categories c
        LEFT JOIN nominees n ON c.id = n.category_id AND n.is_active = 1
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.display_order, c.created_at
      `);

      // Get nominees for each category
      for (const category of categories) {
        const nominees = await this.db.db.all(
          'SELECT * FROM nominees WHERE category_id = ? AND is_active = 1 ORDER BY display_order, created_at',
          [category.id]
        );
        category.nominees = nominees;
      }

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
  }

  async createCategory(req, res) {
    try {
      const { id, title, description, icon, is_award = false, display_order = 0 } = req.body;
      const user = req.user;

      if (!id || !title || !description || !icon) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if category ID already exists
      const existing = await this.db.db.get('SELECT id FROM categories WHERE id = ?', [id]);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Category ID already exists'
        });
      }

      await this.db.db.run(
        `INSERT INTO categories (id, title, description, icon, is_award, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, title, description, icon, is_award ? 1 : 0, display_order]
      );

      // Log audit
      await this.db.logAudit(
        user.userId,
        'CREATE',
        'categories',
        id,
        null,
        { id, title, description, icon, is_award, display_order },
        req.ip
      );

      // Emit real-time update
      this.io.emit('category-created', { id, title, description, icon, is_award, display_order });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { id, title, description, icon, is_award, display_order }
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category'
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { title, description, icon, is_award, display_order } = req.body;
      const user = req.user;

      // Get current category data
      const currentCategory = await this.db.db.get('SELECT * FROM categories WHERE id = ?', [id]);
      if (!currentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (icon !== undefined) updateData.icon = icon;
      if (is_award !== undefined) updateData.is_award = is_award ? 1 : 0;
      if (display_order !== undefined) updateData.display_order = display_order;
      updateData.updated_at = new Date().toISOString();

      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), id];

      await this.db.db.run(
        `UPDATE categories SET ${setClause} WHERE id = ?`,
        values
      );

      // Log audit
      await this.db.logAudit(
        user.userId,
        'UPDATE',
        'categories',
        id,
        currentCategory,
        updateData,
        req.ip
      );

      // Emit real-time update
      this.io.emit('category-updated', { id, ...updateData });

      res.json({
        success: true,
        message: 'Category updated successfully'
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category'
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Get current category data
      const currentCategory = await this.db.db.get('SELECT * FROM categories WHERE id = ?', [id]);
      if (!currentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Soft delete
      await this.db.db.run(
        'UPDATE categories SET is_active = 0, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), id]
      );

      // Also soft delete associated nominees
      await this.db.db.run(
        'UPDATE nominees SET is_active = 0, updated_at = ? WHERE category_id = ?',
        [new Date().toISOString(), id]
      );

      // Log audit
      await this.db.logAudit(
        user.userId,
        'DELETE',
        'categories',
        id,
        currentCategory,
        null,
        req.ip
      );

      // Emit real-time update
      this.io.emit('category-deleted', { id });

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }
  }

  async addNominee(req, res) {
    try {
      const { id: categoryId } = req.params;
      const { name, description = '', display_order = 0 } = req.body;
      const user = req.user;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Nominee name is required'
        });
      }

      // Check if category exists
      const category = await this.db.db.get('SELECT id FROM categories WHERE id = ? AND is_active = 1', [categoryId]);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const result = await this.db.db.run(
        `INSERT INTO nominees (category_id, name, description, display_order)
         VALUES (?, ?, ?, ?)`,
        [categoryId, name, description, display_order]
      );

      const nomineeId = result.lastID;

      // Log audit
      await this.db.logAudit(
        user.userId,
        'CREATE',
        'nominees',
        nomineeId,
        null,
        { category_id: categoryId, name, description, display_order },
        req.ip
      );

      // Emit real-time update
      this.io.emit('nominee-added', {
        id: nomineeId,
        category_id: categoryId,
        name,
        description,
        display_order
      });

      res.status(201).json({
        success: true,
        message: 'Nominee added successfully',
        data: {
          id: nomineeId,
          category_id: categoryId,
          name,
          description,
          display_order
        }
      });
    } catch (error) {
      console.error('Add nominee error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add nominee'
      });
    }
  }

  async updateNominee(req, res) {
    try {
      const { categoryId, nomineeId } = req.params;
      const { name, description, photo_url, display_order } = req.body;
      const user = req.user;

      // Get current nominee data
      const currentNominee = await this.db.db.get(
        'SELECT * FROM nominees WHERE id = ? AND category_id = ?',
        [nomineeId, categoryId]
      );

      if (!currentNominee) {
        return res.status(404).json({
          success: false,
          message: 'Nominee not found'
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (photo_url !== undefined) updateData.photo_url = photo_url;
      if (display_order !== undefined) updateData.display_order = display_order;
      updateData.updated_at = new Date().toISOString();

      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), nomineeId];

      await this.db.db.run(
        `UPDATE nominees SET ${setClause} WHERE id = ?`,
        values
      );

      // Log audit
      await this.db.logAudit(
        user.userId,
        'UPDATE',
        'nominees',
        nomineeId,
        currentNominee,
        updateData,
        req.ip
      );

      // Emit real-time update
      this.io.emit('nominee-updated', {
        id: nomineeId,
        category_id: categoryId,
        ...updateData
      });

      res.json({
        success: true,
        message: 'Nominee updated successfully'
      });
    } catch (error) {
      console.error('Update nominee error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update nominee'
      });
    }
  }

  async deleteNominee(req, res) {
    try {
      const { categoryId, nomineeId } = req.params;
      const user = req.user;

      // Get current nominee data
      const currentNominee = await this.db.db.get(
        'SELECT * FROM nominees WHERE id = ? AND category_id = ?',
        [nomineeId, categoryId]
      );

      if (!currentNominee) {
        return res.status(404).json({
          success: false,
          message: 'Nominee not found'
        });
      }

      // Soft delete nominee
      await this.db.db.run(
        'UPDATE nominees SET is_active = 0, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), nomineeId]
      );

      // Delete associated votes
      await this.db.db.run(
        'DELETE FROM votes WHERE nominee_id = ?',
        [nomineeId]
      );

      // Log audit
      await this.db.logAudit(
        user.userId,
        'DELETE',
        'nominees',
        nomineeId,
        currentNominee,
        null,
        req.ip
      );

      // Emit real-time update
      this.io.emit('nominee-deleted', {
        id: nomineeId,
        category_id: categoryId
      });

      res.json({
        success: true,
        message: 'Nominee deleted successfully'
      });
    } catch (error) {
      console.error('Delete nominee error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete nominee'
      });
    }
  }
}