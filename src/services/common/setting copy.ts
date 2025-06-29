export const MXFORCENAV = "";
export const MXDBLOG = true;

export const MXTHEMES = { D: "dark", M: "moderate", L: "light" };
export const MXFONTS = { L: "large", M: "medium", S: "small" };
export const MXACCESS = ["view", "add", "edit", "delete", "trash", "restore"];

export const MXACTION = {
  view: ["view"],
  add: ["add"],
  edit: ["edit"],
  trash: ["view"],
  list: ["view"],
};

export const MXMACTION = {
  list: ["trash"],
  trash: ["restore", "delete"],
};

export const MXPGFILE = {
  view: "add-edit",
  add: "add-edit",
  edit: "add-edit",
  list: "list",
  trash: "list",
};

export const MXPGMENU = {
  view: ["list", "trash", "add"],
  add: ["list", "trash"],
  edit: ["add", "list", "trash"],
  list: ["add", "trash"],
  trash: ["add", "list"],
};

type AdminMenuItem = {
  adminMenuID: string;
  menuTitle: string;
  seoUri: any;
  dUri: string;
  class: string;
};
export const MXADMINMENU: Record<string, AdminMenuItem> = {
  100000: {
    adminMenuID: "100000",
    menuTitle: "Organization",
    seoUri: "organization",
    dUri: "organization-list",
    class: "fa-group",
  },
  100001: {
    adminMenuID: "100001",
    menuTitle: "Admin Roles",
    seoUri: "admin-role",
    dUri: "admin-role-list",
    class: "fa-key",
  },
  100002: {
    adminMenuID: "100002",
    menuTitle: "Admin Users",
    seoUri: "admin-user",
    dUri: "admin-user-list",
    class: "fa-user",
  },
  100003: {
    adminMenuID: "100003",
    menuTitle: "Admin Menus",
    seoUri: "admin-menu",
    dUri: "admin-menu-list",
    class: "fa-navicon",
  },
  100004: {
    adminMenuID: "100004",
    menuTitle: "Org. Settings",
    seoUri: "setting",
    dUri: "setting-edit",
    class: "fa-gear",
  },
  100005: {
    adminMenuID: "100005",
    menuTitle: "DB Settings",
    seoUri: "db-setting",
    dUri: "db-setting-edit",
    class: "fa-gear",
  },
  100006: {
    adminMenuID: "100006",
    menuTitle: "TPL & META Settings",
    seoUri: "template",
    dUri: "template-list",
    class: "fa-gear",
  },
  100007: {
    adminMenuID: "100007",
    menuTitle: "Site Menu",
    seoUri: "menu",
    dUri: "menu-list",
    class: "fa-navicon",
  },
  100008: {
    adminMenuID: "100008",
    menuTitle: "Optimize Uploads",
    seoUri: "optimize",
    dUri: "optimize-edit",
    class: "fa-archive",
  },
  100009: {
    adminMenuID: "100009",
    menuTitle: "Language",
    seoUri: "language",
    dUri: "language-list",
    class: "fa-language",
  },
};

export const MXADMIN = {
  user: "xadmin",
  pass: "4acefbcacf55283b72fa8c522252e091",
};

export const seoUri = [
  "dashboard",
  "transaction",
  "store",
  "contact-us",
  "mail-subscription",
  "offers",
  "faqs",//
  "state",
  "support-ticket",
  "trade-in",
  "trade-in-location",
  "pages",
  "user",
  "demo",
  "trade-in-campaign",
  "collection",
  "order",
  "product",
  "product-sku",
  "product-image", //#updated by shashank
  "b2b-sells",
];
