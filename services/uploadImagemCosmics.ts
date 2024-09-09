import { createBucketClient } from "@cosmicjs/sdk";
import multer from "multer";

 //importar essas envs para o codigo funcionar
const {
    BUCKET_SLUG,
    READ_KEY,
    WRITE_KEY
} = process.env;

//criar a instancia do cosmic
const bucketDevagran2 = createBucketClient({
    bucketSlug : BUCKET_SLUG as string,
    readKey: READ_KEY as string,
    writeKey: WRITE_KEY as string,
});

const storage = multer.memoryStorage();

const upload = multer({ storage : storage });

const uploadImagemCosmic = async (req: any) => {
    if (req?.file?.originalname){
        if (
            !req.file.originalname.includes(".png") &&
            !req.file.originalname.includes(".jpg") &&
            !req.file.originalname.includes(".jpeg")
        ){
            throw new Error("Extensão da imagem invalida!");
        }
    

        const media_object = {
          originalname: req.file.originalname,
          buffer: req.file.buffer,
        };

       if (req.url && req.url.includes("publicacao")){
            return await bucketDevagran2.media.insertOne({
               media: media_object,
              folder: "publicacao",
            });
       } else {
           return await bucketDevagran2.media.insertOne({
               media: media_object,
              folder: "avatar",
            });
       }
    };
};

export { upload, uploadImagemCosmic };

