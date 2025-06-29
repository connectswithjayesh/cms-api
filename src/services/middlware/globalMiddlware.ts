
import { Request, Response, NextFunction } from 'express';
import path from 'path';

export const globalMiddleware = (req: Request, res: Response, next: NextFunction) => {
    global.VERSION = '1.0';
    global.ONLYADMIN = true;
    global.MXCON = process.env.MXCON || 'LOCAL'; // Fallback to 'LOCAL' if not set

    global.FOLDER = '/cms-api';
    global.DBHOST = 'localhost';
    global.MXDBPRE = 'dev_';
    // global.DBUSER = 'root';
    // global.DBPASS = '';
    // global.DBNAME = `${global.MXDBPRE}astro_2_0`;
    // global.SENDEMAIL = false;

    switch (global.MXCON) {
        case 'LOCAL':
            global.DBHOST = 'localhost';
            global.DBUSER = 'root';
            global.DBPASS = '';
            global.DBNAME = 'dev_cms_1_0';
            global.SENDEMAIL = false;
            break;
        case 'DEV':
            global.DBHOST = '';
            global.DBUSER = '';
            global.DBPASS = '';
            global.DBNAME = ``;
            global.SENDEMAIL = false;
            break;
        case 'LIVE':
            global.DBHOST = '';
            global.DBPASS = '';
            global.DBNAME = '';
            global.SENDEMAIL = false;
            break;
        default:
            break;
    }

    // Define utility functions in the global object as well
    global.isSSL = (): any => {
        return (
            process.env.HTTPS === 'true' ||
            process.env.SERVER_PORT === '443' ||
            (process.env.HTTP_X_FORWARDED_PROTO &&
                process.env.HTTP_X_FORWARDED_PROTO.toLowerCase() === 'https')
        );
    };

    global.DOMAIN = process.env.HTTP_HOST || process.env.SERVER_NAME;
    global.SERV = global.isSSL() ? 'https' : 'http';
    global.SITEURL = `${global.SERV}://${global.DOMAIN}${global.FOLDER}`;
    global.ADMINDIR = 'xadmin';
    global.ROOTPATH = `${process.cwd()}`;

    global.SITEPATH = global.ONLYADMIN ? global.ROOTPATH : `${global.ROOTPATH}/xsite`;
    global.ADMINURL = global.ONLYADMIN ? global.SITEURL : `${global.SITEURL}/${global.ADMINDIR}`;
    global.ADMINPATH = `${global.ROOTPATH}/${global.ADMINDIR}`;
    global.LIBURL = `${global.SITEURL}/lib`;
    global.LIBPATH = `${global.ROOTPATH}/lib`;
    global.UPLOADURL = `${global.SITEURL}/uploads`;
    global.UPLOADPATH = `${global.ROOTPATH}/uploads`;
    global.COREURL = `${global.SITEURL}/core`;
    global.COREPATH = `${global.ROOTPATH}/core`;

    global.JWT_SERCRECT_KEY = 'KbjnUbGsxDE9Soe0IcbB8';
    global.JWT_EXPIRATION = '1h'
    global.FRONT_END_URL = 'http://localhost:4200';
    global.ALLOW_ORIGINS = ['http://localhost:4200'];

    next();
}


