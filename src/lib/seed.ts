import User from '@/models/user';
import logger from '@/lib/logger';
import config from '@/config';

/**
 * Seeds the database with initial super admin if none exists
 */
export const seedSuperAdmin = async (): Promise<void> => {
  try {
    // Check if any super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      logger.info('Super admin already exists, skipping seed');
      return;
    }

    // Get super admin email from environment variable
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set in environment variables');
      return;
    }

    // Create the super admin
    const superAdmin = await User.create({
      username: 'superadmin',
      email: superAdminEmail,
      password: superAdminPassword,
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      isEmailVerified: true,
      isActive: true,
    });

    logger.info('Super admin created successfully', {
      id: superAdmin._id,
      email: superAdmin.email,
      username: superAdmin.username,
    });

    // Log the creation
    await logger.log(
      superAdmin as any,
      'SEED_SUPER_ADMIN',
      'SYSTEM',
      `Super admin seeded: ${superAdmin.email}`,
      superAdmin._id.toString(),
      [
        { field: 'username', oldValue: null, newValue: superAdmin.username },
        { field: 'email', oldValue: null, newValue: superAdmin.email },
        { field: 'role', oldValue: null, newValue: superAdmin.role },
        { field: 'firstName', oldValue: null, newValue: superAdmin.firstName },
        { field: 'lastName', oldValue: null, newValue: superAdmin.lastName },
      ]
    );

  } catch (error) {
    logger.error('Error seeding super admin:', error);
    throw error;
  }
};
