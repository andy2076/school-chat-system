const authService = require('../core/authService');

/**
 * 認証ミドルウェア
 * - JWTトークンの検証
 * - ユーザー情報の取得
 * - 権限チェック
 */

/**
 * JWTトークン認証ミドルウェア
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Authorizationヘッダーの確認
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Authorization header is required',
        message: 'No authorization header provided'
      });
    }

    // Bearer トークンの形式チェック
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        error: 'Token is required',
        message: 'No token provided in authorization header'
      });
    }

    // トークンの検証
    const decoded = authService.verifyToken(token);
    
    // TODO: データベースからユーザー情報を取得
    // const user = await userQueries.findById(decoded.userId);
    // if (!user) {
    //   return res.status(401).json({ 
    //     error: 'User not found',
    //     message: 'Token is valid but user does not exist'
    //   });
    // }

    // リクエストオブジェクトにユーザー情報を追加
    req.user = {
      userId: decoded.userId,
      lineUserId: decoded.lineUserId,
      userType: decoded.userType,
      studentId: decoded.studentId
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // JWTエラーに応じたレスポンス
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'The provided token has expired'
      });
    }

    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * 権限チェックミドルウェアを生成
 * @param {string|Array} requiredRoles - 必要な権限（単一またはarray）
 * @returns {Function} ミドルウェア関数
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      // 認証チェック
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'User must be authenticated'
        });
      }

      // 権限の配列化
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      // ユーザーの権限チェック
      const hasPermission = roles.some(role => 
        authService.checkPermission(req.user, role)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: `Required role: ${roles.join(' or ')}, User role: ${req.user.userType}`
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        error: 'Permission check failed',
        message: 'Internal server error during permission check'
      });
    }
  };
};

/**
 * 管理者権限チェックミドルウェア
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
const requireAdmin = requireRole('admin');

/**
 * 教職員権限チェックミドルウェア（教師と管理者）
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
const requireTeacher = requireRole(['teacher', 'admin']);

/**
 * ルームアクセス権限チェックミドルウェア
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
const checkRoomAccess = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    // TODO: データベースでルームアクセス権限を確認
    // const hasAccess = await roomQueries.checkUserAccess(roomId, userId);
    // if (!hasAccess) {
    //   return res.status(403).json({ 
    //     error: 'Room access denied',
    //     message: 'You do not have access to this room'
    //   });
    // }

    // 管理者は全ルームにアクセス可能
    if (req.user.userType === 'admin') {
      return next();
    }

    // TODO: 実際のアクセスチェックが実装されるまでは通す
    console.log(`[DEBUG] Room access check for user ${userId} to room ${roomId} - not implemented yet`);
    next();
  } catch (error) {
    console.error('Room access check error:', error);
    return res.status(500).json({ 
      error: 'Room access check failed',
      message: 'Internal server error during room access check'
    });
  }
};

/**
 * オプショナル認証ミドルウェア
 * トークンがある場合は認証を行い、ない場合はそのまま通す
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return next();
    }

    try {
      const decoded = authService.verifyToken(token);
      req.user = {
        userId: decoded.userId,
        lineUserId: decoded.lineUserId,
        userType: decoded.userType,
        studentId: decoded.studentId
      };
    } catch (tokenError) {
      // トークンエラーの場合も通すが、ユーザー情報は設定しない
      console.warn('Optional auth token error:', tokenError.message);
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  requireTeacher,
  checkRoomAccess,
  optionalAuth
};