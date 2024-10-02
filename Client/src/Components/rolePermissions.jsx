// src/config/rolePermissions.js
const rolesPermissions = {
    Admin: {
      canAccess: [
        '/home',
        '/contact-data-org',
        '/Team',
        '/documents',
        '/contactData',
        '/projects',
        '/contact-data-event-code',
        '/calender',
        '/event-group-master',
        '/usercreationutility',
        '/user_Creation',
      ],
    },
    Editor: {
      canAccess: [
        '/home',
        '/contact-data-org',
        '/Team',
        '/documents',
        '/projects',
        '/contact-data-event-code',
      ],
    },
    Viewer: {
      canAccess: ['/home', '/contact-data-org', '/Team'],
    },
  };
  
  export default rolesPermissions;
  