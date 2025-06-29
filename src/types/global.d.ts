declare global {
  namespace NodeJS {
    interface Global {
      VERSION: string;
      ONLYADMIN: boolean;
      MXCON: string;
      FOLDER: string;
      DBHOST: string;
      MXDBPRE: string;
      DBUSER: string;
      DBPASS: string;
      DBNAME: string;
      SENDEMAIL: boolean;
      DOMAIN: string;
      SERV: string;
      SITEURL: string;
      ADMINDIR: string;
      ROOTPATH: string;
      SITEPATH: string;
      ADMINURL: string;
      ADMINPATH: string;
      LIBURL: string;
      LIBPATH: string;
      UPLOADURL: string;
      UPLOADPATH: string;
      COREURL: string;
      COREPATH: string;
      JWT_SERCRECT_KEY: string;
      INGENICO_MRCH_CODE: string;
      INGENICO_KEY: string;
      INGENICO_IV: string;
      INGENICO_SCODE: string;
      FRONT_END_URL: string;
      DEV_EMAILS: string[];
      ALLOW_ORIGINS: string[];
      isSSL: () => boolean;
  }
  }
}



