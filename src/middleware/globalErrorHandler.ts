import { Prisma } from '../../generated/prisma/client';
import { NextFunction,Request,Response } from "express"

function errorHandler (
    err:any,
    req:Request,
    res:Response,
    next:NextFunction) 
    
    {
    let statusCode = 500;
    let errorMessage = "Internal server Error";
    let errorDetails = err;

//PrismaClientValidationError

    if(err instanceof Prisma.PrismaClientValidationError){
        statusCode = 400;
        errorMessage = "you provide Incorrect field type or Missing fields";
    }

//Prisma Client Known RequestError

    else if(err instanceof Prisma.PrismaClientKnownRequestError){
         if(err.code === "P2025"){
            statusCode = 400;
            errorMessage = "An operation failed because it depends on one or more records that were required but not found. {cause}";
         }
         else if(err.code === "P2002"){
            statusCode = 409;
            errorMessage = "Unique constraint failed on the {constraint}";
         }
         else if(err.code === "P2001"){
            statusCode = 404;
            errorMessage = "Record expected but not found (e.g., update, delete, or findUniqueOrThrow)";
         }
         else if(err.code === "P2000"){
            statusCode = 400;
            errorMessage = "You tried to insert a string/value exceeding DB column length";
         }
         else if(err.code === "P2003"){
            statusCode = 400;
            errorMessage = "Referenced record in another table does not exist";
         }
         else if(err.code === "P2004"){
            statusCode = 400;
            errorMessage = "Generic DB constraint failure";
         }
         else if(err.code === "P2005"){
            statusCode = 400;
            errorMessage = "Tried to insert invalid data type into a column";
         }
         else if(err.code === "P2016"){
            statusCode = 404;
            errorMessage = "findUniqueOrThrow or findFirstOrThrow didn’t find record";
         }
    }

// Prisma Client Unknown RequestError    

    else if(err instanceof Prisma.PrismaClientUnknownRequestError){
        statusCode = 500;
        errorMessage = "An unkonw error occured during query execution";
    }

    else if(err instanceof Prisma.PrismaClientInitializationError){
        if(err.errorCode === "P1000"){
            statusCode = 401;
            errorMessage = "Database authentication failed. Invalid database credentials."
        }
        if(err.errorCode === "P1001"){
            statusCode = 503;
            errorMessage = "Database server is unreachable or timed out."
        }
        if(err.errorCode === "P1003"){
            statusCode = 500;
            errorMessage = "Database does not exist. Server configuration error."
        }
        if(err.errorCode === "P1010"){
            statusCode = 403;
            errorMessage = "Database access denied. Insufficient privileges."
        }
    }

  res.status(statusCode)
  res.json({
    message: errorMessage,
    Error: errorDetails
  })
}

export default errorHandler;