import type { NextApiRequest, NextApiResponse} from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import type { CadastroRequisicao} from '../../types/CadastroRequisicao';
import {UsuarioModel} from '../../models/UsuarioModel';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import md5 from 'md5';
import {upload, uploadImagemCosmic} from '../../services/uploadImagemCosmics';
import nc from 'next-connect';
import {politicaCORS} from '../../middlewares/politicaCORS';


const handler = nc()
    .use(upload.single('file'))
    .post(async ( req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
        
        try{
        const usuario = req.body as CadastroRequisicao;

        if(!usuario.nome || usuario.nome.length < 2){
            return res.status(400).json({erro :'Nome invalido!'})
        }

        if(!usuario.email || usuario.email.length < 5 
            || !usuario.email.includes('@') 
            || !usuario.email.includes('.')){
            return res.status(400).json({erro :'Email invalido!'})
        }

        if(!usuario.senha || usuario.senha.length < 4){
            return res.status(400).json({erro :'Senha invalida!'})
        }

        // validacao se ja existe usuario com o mesmo email
        const usuariosComMesmoEmail = await UsuarioModel.find({ email: usuario.email});
        if( usuariosComMesmoEmail && usuariosComMesmoEmail.length > 0){
            return res.status(400).json({erro :'Este email ja esta em uso!'})
        }

        // enviar imagem do multer para o cosmic
        const image = await uploadImagemCosmic(req);

        // para criptografar a senha
        const usuarioASerSalvo = {
            nome : usuario.nome,
            email : usuario.email,
            senha : md5(usuario.senha),
            avatar : image?.media?.url,
        };

        // salvar no banco de dados
        await UsuarioModel.create(usuarioASerSalvo);
        return res.status(200).json({msg: 'Usuario cadastrado com sucesso!'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro:'Erro ao cadastrar usuario!'});
    }
});

export  const config = {
    api : {
        bodyParser : false
    }
} 

export default politicaCORS(conectarMongoDB(handler));