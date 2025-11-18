import { Request, Response, NextFunction } from 'express';
import User from '@/models/user';
import Client from '@/models/client';
import Meet from '@/models/meet';
import logger from '@/lib/logger';

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          code: 'AuthenticationError',
          message: 'Authentication required',
        });
      }

      const user = await User.findById(req.userId).select('role refAdmin').lean().exec();
      
      if (!user) {
        return res.status(401).json({
          code: 'AuthenticationError',
          message: 'User not found',
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          code: 'AuthorizationError',
          message: 'Insufficient permissions',
        });
      }

      req.user = user as any;
      next();
    } catch (error) {
      logger.error('Role-based access control error:', error);
      res.status(500).json({
        code: 'InternalServerError',
        message: 'Internal server error',
      });
    }
  };
};

// Check if user can access resource based on refAdmin
export const checkResourceAccess = (resourceType: 'client' | 'meet') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          code: 'AuthenticationError',
          message: 'Authentication required',
        });
      }

      const user = await User.findById(req.userId).select('role refAdmin').lean().exec();
      
      if (!user) {
        return res.status(401).json({
          code: 'AuthenticationError',
          message: 'User not found',
        });
      }

      // Super admin can access everything
      if (user.role === 'superadmin') {
        req.user = user as any;
        return next();
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          code: 'ValidationError',
          message: 'Resource ID is required',
        });
      }

      let resource;
      let refAdminField;

      switch (resourceType) {
        case 'client':
          resource = await Client.findById(resourceId).select('refAdmin').lean().exec();
          refAdminField = 'refAdmin';
          break;
        case 'meet':
          resource = await Meet.findById(resourceId).select('refAdmin').lean().exec();
          refAdminField = 'refAdmin';
          break;
        default:
          return res.status(400).json({
            code: 'ValidationError',
            message: 'Invalid resource type',
          });
      }

      if (!resource) {
        return res.status(404).json({
          code: 'NotFoundError',
          message: 'Resource not found',
        });
      }

      // Check if user is admin and owns the resource, or if user is regular user under the same admin
      const resourceAdminId = resource[refAdminField as keyof typeof resource];
      
      if (user.role === 'admin' && resourceAdminId?.toString() === user._id?.toString()) {
        req.user = user as any;
        return next();
      }

      if (user.role === 'user' && resourceAdminId?.toString() === user.refAdmin?.toString()) {
        req.user = user as any;
        return next();
      }

      return res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied to this resource',
      });
    } catch (error) {
      logger.error('Resource access control error:', error);
      res.status(500).json({
        code: 'InternalServerError',
        message: 'Internal server error',
      });
    }
  };
};

// Middleware to ensure only super admin can access
export const requireSuperAdmin = requireRole(['superadmin']);

// Middleware to ensure only admin or super admin can access
export const requireAdmin = requireRole(['admin', 'superadmin']);

// Middleware to ensure any authenticated user can access
export const requireAuth = requireRole(['user', 'admin', 'superadmin']);
