import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'name'],
  },
  auth: {
    useAPIKey: true, // Enable API key generation in admin dashboard
  },
  access: {
    // Require authentication (session or API key) to read users (needed for relationships)
    read: ({ req: { user } }) => !!user,
    // Only super admins can create new users
    create: ({ req: { user } }) => {
      return user?.role === 'super-admin'
    },
    // Users can update themselves, super admins can update anyone, but others cannot update super admins
    update: ({ req: { user }, id }) => {
      if (user?.role === 'super-admin') {
        return true
      }
      // Regular users can only update their own profile
      if (user && id) {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Only super admins can delete users
    delete: ({ req: { user } }) => {
      return user?.role === 'super-admin'
    },
  },
  fields: [
    // Email added by default
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Product', value: 'product' },
        { label: 'Viewer', value: 'viewer' },
      ],
      defaultValue: 'viewer',
      required: true,
      access: {
        // Only super admins can change roles
        update: ({ req: { user } }) => {
          return user?.role === 'super-admin'
        },
      },
      admin: {
        description: 'User role determines access permissions. Super Admin can manage all companies.',
      },
    },
  ],
}
