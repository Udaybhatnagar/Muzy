import { NextResponse } from "next/server";

export function GET(){
//this is the synatx to write the api's in the NEXT backend...
    return NextResponse.json({
        user:"uday",
        email:"udaybhatangar502@gmail.com"
    })

}