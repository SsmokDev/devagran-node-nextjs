import type { NextApiRequest, NextApiResponse } from 'next'; //Request, Response e Handler padrão do Next
import { validarTokenJWT } from '../../middlewares/validarTokenJWT'; // Importando o middleware de validação do token JWT criado
import {conectarMongoDB} from '../../middlewares/conectarMongoDB'; // importando o middleware de conexão com DB que foi criado
import {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg' // importando o tipo de resposta padrão que criamos
import { UsuarioModel } from '@/models/UsuarioModel'; // Importando o model do usuário
import { PublicacaoModel } from '@/models/PublicacaoModel'; // Importando o model da publicação
import publicacao from './publicacao';

const feedEndpoint = async (req:NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if(req.method === 'GET'){
            // verifica o método HTTP do request caso seja algo diferente de GET retornará que o método não é válido

            if(req?.query?.id){
                // Verifica na query se passamos algum ID para mostrarmos o Feed de um usuário específico

                const usuario = await UsuarioModel.findById(req?.query?.id);// Procura na DB o usuário passado pelo ID
                if(!usuario){
                    // Caso não exista usuário com esse ID retorna um erro de usuário não encontrado
                    return res.status(400).json({erro:'Usuario nao encontrado!'});
                }

                const publicacoes = await PublicacaoModel
                .find({idUsuario : usuario._id,})
                .sort({data : -1});
                const result = [];

                for (const publicacao of publicacoes){
                    const usuarioDaPublicacao = await UsuarioModel.findById(publicacao.idUsuario);
                    if (usuarioDaPublicacao) {
                        const final = {
                            ...publicacao._doc, usuario: {
                                nome: usuarioDaPublicacao.nome,
                                avatar: usuarioDaPublicacao.avatar,
                            },
                        };
                        result.push(final);
                    }
                }
                return res.status(200).json(result);
            }

            return res.status(200).json(publicacao);
        }
        return res.status(405).json({erro:'Metodo informado nao e valido!'});
    } catch (e) {
        console.log(e);
    }
    res.status(400).json({erro:'Nao foi possivel obter o feed do usuario!'});
}

export default validarTokenJWT(conectarMongoDB(feedEndpoint));