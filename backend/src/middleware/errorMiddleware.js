/**
 * エラーハンドリングミドルウェア
 * - グローバルエラーハンドリング
 * - エラーログ出力
 * - 環境に応じたエラーレスポンス
 */

/**
 * 404エラーハンドラー
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * グローバルエラーハンドラー
 * @param {Error} error - エラーオブジェクト
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
const globalErrorHandler = (error, req, res, next) => {
  // デフォルトのステータスコード
  let statusCode = error.status || error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  
  // 開発環境でのみスタックトレースを表示
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // エラーログ出力
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);
  if (isDevelopment) {
    console.error('Stack trace:', error.stack);
  }
  console.error('Request details:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // データベースエラーのハンドリング
  if (error.name === 'MongoError' || error.name === 'SequelizeError') {
    statusCode = 500;
    message = 'Database error occurred';
    console.error('Database error:', error);
  }

  // バリデーションエラーのハンドリング
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    
    // バリデーションエラーの詳細を含める
    if (error.errors) {
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });
      
      return res.status(statusCode).json({
        error: 'Validation Error',
        message,
        details: validationErrors,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }
  }

  // JWTエラーのハンドリング
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
  }

  // 権限エラーのハンドリング
  if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  // Multerエラーのハンドリング（ファイルアップロード）
  if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File size too large';
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    statusCode = 413;
    message = 'Too many files';
  }

  // レスポンスの構築
  const errorResponse = {
    error: getErrorType(statusCode),
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // 開発環境でのみスタックトレースを含める
  if (isDevelopment) {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      name: error.name,
      code: error.code
    };
  }

  // 本番環境では内部サーバーエラーの詳細を隠す
  if (!isDevelopment && statusCode === 500) {
    errorResponse.message = 'Something went wrong';
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * ステータスコードに基づいてエラータイプを取得
 * @param {number} statusCode - HTTPステータスコード
 * @returns {string} エラータイプ
 */
const getErrorType = (statusCode) => {
  switch (Math.floor(statusCode / 100)) {
    case 4:
      switch (statusCode) {
        case 400: return 'Bad Request';
        case 401: return 'Unauthorized';
        case 403: return 'Forbidden';
        case 404: return 'Not Found';
        case 409: return 'Conflict';
        case 413: return 'Payload Too Large';
        case 422: return 'Unprocessable Entity';
        case 429: return 'Too Many Requests';
        default: return 'Client Error';
      }
    case 5:
      switch (statusCode) {
        case 500: return 'Internal Server Error';
        case 502: return 'Bad Gateway';
        case 503: return 'Service Unavailable';
        case 504: return 'Gateway Timeout';
        default: return 'Server Error';
      }
    default:
      return 'Unknown Error';
  }
};

/**
 * 非同期エラーキャッチャー
 * 非同期関数をラップしてエラーを自動的にnextに渡す
 * @param {Function} fn - 非同期関数
 * @returns {Function} ラップされた関数
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * リクエストロギングミドルウェア
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // レスポンス終了時にログ出力
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`[${new Date().toISOString()}] [${logLevel}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    
    // エラーレスポンスの場合は詳細ログ
    if (res.statusCode >= 400) {
      console.log('Request details:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer') || 'N/A'
      });
    }
  });
  
  next();
};

/**
 * APIレスポンス統計を記録するミドルウェア
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
const responseStats = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // ミリ秒
    
    // TODO: 統計データをデータベースやメトリクスシステムに送信
    // 現在はコンソール出力のみ
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Stats: ${req.method} ${req.route?.path || req.originalUrl} - ${res.statusCode} (${duration.toFixed(2)}ms)`);
    }
  });
  
  next();
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
  asyncHandler,
  requestLogger,
  responseStats
};