import type { NextApiRequest, NextApiResponse } from 'next'; //Request, Response e Handler padrão do Next
import { validarTokenJWT } from '../../middlewares/validarTokenJWT'; // Importando o middleware de validação do token JWT criado
import {conectarMongoDB} from '../../middlewares/conectarMongoDB'; // importando o middleware de conexão com DB que foi criado
import {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg' // importando o tipo de resposta padrão que criamos
import { UsuarioModel } from '@/models/UsuarioModel'; // Importando o model do usuário
import { PublicacaoModel } from '@/models/PublicacaoModel'; // Importando o model da publicação
import publicacao from './publicacao';
import { SeguidorModel } from '@/models/SeguidorModel';
import { politicaCORS } from '@/middlewares/politicaCORS';

const feedEndpoint = async (req:NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
  try {
    if(req.method === 'GET'){
          
      if(req?.query?.id){
            
        const usuario = await UsuarioModel.findById(req.query.id);
        if (!usuario) {
          
          return res.status(400).json({ erro: "Usuário não encontrado" });
        }
            
    
        const publicacoes = await PublicacaoModel.find({
          idUsuario: usuario._id,
        }).sort({ data: -1 }); 
        const result = [];
    
        for (const publicacao of publicacoes) {
          
          const usuarioDaPublicacao = await UsuarioModel.findById(
            publicacao.idUsuario
          ); 
          if (usuarioDaPublicacao) {
            
            const final = {
              ...publicacao._doc, 
              usuario: { 
                nome: usuarioDaPublicacao.nome,
                avatar: usuarioDaPublicacao.avatar,
              }
            };
            result.push(final); 
          }
        }
        return res.status(200).json(result);
      }else{
        console.log('aqui');
          const {userId} = req.query;
          const usuarioLogado = await UsuarioModel.findById(userId);
          if(!usuarioLogado){
              return res.status(400).json({erro:'Usuario nao encontrado!'});
          }

        const seguidores = await SeguidorModel.find({usuarioId : usuarioLogado._id});

        const seguidoresIds = seguidores.map((s) => s.usuarioSeguidoId);

        const publicacoes = await PublicacaoModel.find({
            $or : [
                {idUsuario : usuarioLogado._id},
                {idUsuario : seguidoresIds}
            ]
        })
        .sort({data : -1});

        const result = [];
        for (const publicacao of publicacoes){
          const usuarioDaPublicacao = await UsuarioModel.findById(publicacao.idUsuario);
          if(usuarioDaPublicacao){
            const final = {
                ...publicacao._doc, usuario : {
                    nome : usuarioDaPublicacao.nome,
                    avatar : usuarioDaPublicacao.avatar,
                }
            };
            result.push(final);
          }
        }
        return res.status(200).json(result);
      }
    }
      return res.status(405).json({erro:'Metodo informado nao e valido!'});
  }catch (e){
    console.log(e);
  }
  return res.status(400).json({erro:'Nao foi possivel obter o feed do usuario!'});
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)));