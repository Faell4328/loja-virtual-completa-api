import { Request, Response } from 'express';

import loginService from '../../services/system/loginService';
import { validationResult } from 'express-validator';
import Cookie from '../../services/system/cookie';
import serverSendingPattern from '../serverSendingPattern';

interface serviceReturnProps{
    status: boolean;
    token: string | null;
    expiration: Date | null
}

export default async function loginController(req: Request, res: Response){

    const errors:any = validationResult(req);

    if(!errors.isEmpty()){
        serverSendingPattern(res, null, errors.errors[0].msg, null, null);
        return;
    }

    const { email, password } = req.body
    
    const serviceReturn: boolean|string|serviceReturnProps = await loginService(email, password);

    if(serviceReturn === false){
        serverSendingPattern(res, null, 'Email ou senha incorreto', null, null);
        return;
    }
    else if(typeof(serviceReturn) == 'object'){

        // !!Add function for log record, this is error!!
        if(serviceReturn.token == null || serviceReturn.expiration == null){
            serverSendingPattern(res, null, 'Não foi possível fazer login, por favor, entre em contado com o suporte', null, null);
            return;
        }

        Cookie.setCookie(res, serviceReturn.token, serviceReturn.expiration);
        serverSendingPattern(res, '/', null, 'Login realizado', null);
        return;
    }
    else{
        serverSendingPattern(res, '/confirmacao', 'Você não confirmou o email ainda para realizar o login', null, null);
        return;
    }
}