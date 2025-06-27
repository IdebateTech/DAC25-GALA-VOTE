export class VotingController {
  constructor(db, io) {
    this.db = db;
    this.io = io;
  }

  async castVote(req, res) {
    try {
      const { sessionId, categoryId, nomineeId } = req.body;

      if (!sessionId || !categoryId || !nomineeId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID, category ID, and nominee ID are required'
        });
      }

      // Check if voting is enabled
      const votingEnabled = await this.db.db.get(
        'SELECT value FROM system_settings WHERE key = ?',
        ['voting_enabled']
      );

      if (!votingEnabled || votingEnabled.value !== 'true') {
        return res.status(403).json({
          success: false,
          message: 'Voting is currently disabled'
        });
      }

      // Check if voting deadline has passed
      const votingEndDate = await this.db.db.get(
        'SELECT value FROM system_settings WHERE key = ?',
        ['voting_end_date']
      );

      if (votingEndDate && new Date() > new Date(votingEndDate.value)) {
        return res.status(403).json({
          success: false,
          message: 'Voting deadline has passed'
        });
      }

      // Verify category and nominee exist
      const category = await this.db.db.get(
        'SELECT id FROM categories WHERE id = ? AND is_active = 1',
        [categoryId]
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const nominee = await this.db.db.get(
        'SELECT id FROM nominees WHERE id = ? AND category_id = ? AND is_active = 1',
        [nomineeId, categoryId]
      );

      if (!nominee) {
        return res.status(404).json({
          success: false,
          message: 'Nominee not found'
        });
      }

      // Check if user has already voted in this category
      const existingVote = await this.db.db.get(
        'SELECT id FROM votes WHERE session_id = ? AND category_id = ?',
        [sessionId, categoryId]
      );

      if (existingVote) {
        // Update existing vote
        await this.db.db.run(
          'UPDATE votes SET nominee_id = ?, updated_at = ? WHERE id = ?',
          [nomineeId, new Date().toISOString(), existingVote.id]
        );
      } else {
        // Insert new vote
        await this.db.db.run(
          `INSERT INTO votes (session_id, category_id, nominee_id, ip_address, user_agent)
           VALUES (?, ?, ?, ?, ?)`,
          [sessionId, categoryId, nomineeId, req.ip, req.get('User-Agent')]
        );
      }

      // Emit real-time update
      this.io.emit('vote-cast', {
        categoryId,
        nomineeId,
        sessionId
      });

      res.json({
        success: true,
        message: 'Vote cast successfully'
      });
    } catch (error) {
      console.error('Cast vote error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cast vote'
      });
    }
  }

  async getVoteStats(req, res) {
    try {
      const stats = await this.db.db.all(`
        SELECT 
          c.id as category_id,
          c.title as category_title,
          n.id as nominee_id,
          n.name as nominee_name,
          COUNT(v.id) as vote_count
        FROM categories c
        LEFT JOIN nominees n ON c.id = n.category_id AND n.is_active = 1
        LEFT JOIN votes v ON n.id = v.nominee_id
        WHERE c.is_active = 1 AND c.is_award = 0
        GROUP BY c.id, n.id
        ORDER BY c.display_order, n.display_order
      `);

      // Organize stats by category
      const organizedStats = {};
      stats.forEach(stat => {
        if (!organizedStats[stat.category_id]) {
          organizedStats[stat.category_id] = {
            category_title: stat.category_title,
            nominees: []
          };
        }
        
        if (stat.nominee_id) {
          organizedStats[stat.category_id].nominees.push({
            nominee_id: stat.nominee_id,
            nominee_name: stat.nominee_name,
            vote_count: stat.vote_count
          });
        }
      });

      res.json({
        success: true,
        data: organizedStats
      });
    } catch (error) {
      console.error('Get vote stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vote statistics'
      });
    }
  }

  async getUserVotes(req, res) {
    try {
      const { sessionId } = req.params;

      const userVotes = await this.db.db.all(
        `SELECT v.category_id, v.nominee_id, n.name as nominee_name
         FROM votes v
         JOIN nominees n ON v.nominee_id = n.id
         WHERE v.session_id = ?`,
        [sessionId]
      );

      const votesMap = {};
      userVotes.forEach(vote => {
        votesMap[vote.category_id] = {
          nominee_id: vote.nominee_id,
          nominee_name: vote.nominee_name
        };
      });

      res.json({
        success: true,
        data: votesMap
      });
    } catch (error) {
      console.error('Get user votes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user votes'
      });
    }
  }
}