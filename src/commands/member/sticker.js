const { writeFileSync, readFileSync, existsSync, mkdirSync, unlinkSync } = require("fs");
const path = require("path");
const { spawn } = require("child_process");

module.exports = {
  name: "sticker",
  description: "Convierte una imagen en un sticker.",
  commands: ["sticker", "stiker", "s"],
  usage: "/sticker (responde a una imagen)",
  handle: async ({ msg, sendSticker, quoted, userJid, sendReply, isMedia, downloadMedia }) => {
    try {
      // Enviar mensaje de procesamiento
      await sendReply("⌛ Procesando imagen... Espera un momento.");
      
      // Rastreo para depuración
      console.log("DEBUG - Iniciando comando sticker");
      console.log("DEBUG - quoted:", quoted ? "existe" : "no existe");
      console.log("DEBUG - isMedia:", isMedia);
      
      // 1. Primero intentar obtener la imagen desde el mensaje citado
      let buffer = null;
      let isImageFound = false;
      
      // Verificar si hay un mensaje citado con imagen
      if (quoted && quoted.mimetype && quoted.mimetype.includes("image")) {
        console.log("DEBUG - Encontrada imagen en mensaje citado");
        try {
          buffer = await quoted.download();
          if (buffer && buffer.length > 0) {
            isImageFound = true;
            console.log("DEBUG - Imagen descargada de mensaje citado");
          }
        } catch (err) {
          console.error("Error al descargar imagen citada:", err);
        }
      }
      
      // 2. Si no hay imagen en mensaje citado, intentar con el contexto actual
      if (!isImageFound) {
        console.log("DEBUG - Intentando obtener imagen del contexto actual");
        
        // Verificar si el mensaje actual tiene una imagen adjunta
        if (isMedia && msg && msg.type && (msg.type === "imageMessage" || (msg.type === "extendedTextMessage" && msg.contextInfo && msg.contextInfo.quotedMessage && msg.contextInfo.quotedMessage.imageMessage))) {
          try {
            buffer = await downloadMedia();
            if (buffer && buffer.length > 0) {
              isImageFound = true;
              console.log("DEBUG - Imagen descargada del contexto actual");
            }
          } catch (err) {
            console.error("Error al descargar imagen del contexto:", err);
          }
        }
      }
      
      // 3. Buscar imágenes en todo el contexto si es necesario
      if (!isImageFound && msg && msg.contextInfo) {
        console.log("DEBUG - Buscando imagen en todo el contexto");
        try {
          // Intentar diferentes formas de obtener la imagen dependiendo de la estructura
          if (msg.contextInfo.quotedMessage && msg.contextInfo.quotedMessage.imageMessage) {
            buffer = await downloadMedia(msg.contextInfo.quotedMessage.imageMessage);
            isImageFound = true;
            console.log("DEBUG - Imagen encontrada en quotedMessage.imageMessage");
          } else if (msg.contextInfo.quotedMessage && msg.contextInfo.quotedMessage.viewOnceMessage && msg.contextInfo.quotedMessage.viewOnceMessage.message.imageMessage) {
            buffer = await downloadMedia(msg.contextInfo.quotedMessage.viewOnceMessage.message.imageMessage);
            isImageFound = true;
            console.log("DEBUG - Imagen encontrada en viewOnceMessage");
          }
        } catch (err) {
          console.error("Error al buscar en contexto completo:", err);
        }
      }
      
      // Si después de todos los intentos no hay imagen, informar al usuario
      if (!isImageFound || !buffer || buffer.length === 0) {
        console.log("DEBUG - No se encontró ninguna imagen");
        await sendReply("❌ No se encontró ninguna imagen. Debes responder a una imagen con el comando /sticker o enviar una imagen con el comando en el pie de foto.");
        return;
      }
      
      // Crear directorio temporal si no existe
      const tempDir = path.resolve(__dirname, "../../temp");
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
        console.log("DEBUG - Directorio temporal creado:", tempDir);
      }
      
      // Generar nombres de archivo únicos
      const uniqueId = Date.now().toString();
      const tempImg = path.resolve(tempDir, `${uniqueId}.png`);
      const tempWebp = path.resolve(tempDir, `${uniqueId}.webp`);
      
      // Guardar la imagen descargada
      try {
        writeFileSync(tempImg, buffer);
        console.log("DEBUG - Imagen guardada en:", tempImg);
      } catch (writeError) {
        console.error("Error al guardar imagen:", writeError);
        await sendReply("❌ Error al guardar la imagen temporalmente.");
        return;
      }
      
      // Convertir a webp usando FFmpeg
      console.log("DEBUG - Iniciando conversión con FFmpeg");
      try {
        await new Promise((resolve, reject) => {
          // Intentar con parámetros más simples para mayor compatibilidad
          const ffmpegProcess = spawn("ffmpeg", [
            "-i", tempImg,
            "-vf", "scale=512:512",
            "-f", "webp",
            tempWebp
          ]);
          
          let ffmpegOutput = "";
          ffmpegProcess.stderr.on("data", (data) => {
            ffmpegOutput += data.toString();
          });
          
          ffmpegProcess.on("error", (error) => {
            console.error("Error al ejecutar FFmpeg:", error);
            reject(error);
          });
          
          ffmpegProcess.on("close", (code) => {
            if (code === 0) {
              console.log("DEBUG - Conversión exitosa");
              resolve();
            } else {
              console.error("FFmpeg salió con código:", code);
              console.error("FFmpeg output:", ffmpegOutput);
              reject(new Error(`FFmpeg salió con código ${code}`));
            }
          });
        });
      } catch (conversionError) {
        console.error("Error en conversión:", conversionError);
        
        // Intentar con método alternativo si falla el primero
        try {
          console.log("DEBUG - Intentando método alternativo de conversión");
          await new Promise((resolve, reject) => {
            const process = spawn("ffmpeg", [
              "-i", tempImg,
              tempWebp
            ]);
            
            process.on("close", (code) => {
              if (code === 0) resolve();
              else reject(new Error(`FFmpeg alternativo salió con código ${code}`));
            });
          });
        } catch (altError) {
          console.error("Error en método alternativo:", altError);
          await sendReply("❌ Error al convertir la imagen. Verifica que FFmpeg esté instalado correctamente.");
          
          // Limpiar
          if (existsSync(tempImg)) unlinkSync(tempImg);
          return;
        }
      }
      
      // Verificar que se haya creado el archivo webp
      if (!existsSync(tempWebp)) {
        console.error("El archivo webp no se generó");
        await sendReply("❌ No se pudo generar el sticker.");
        if (existsSync(tempImg)) unlinkSync(tempImg);
        return;
      }
      
      // Leer el archivo webp
      let stickerBuffer;
      try {
        stickerBuffer = readFileSync(tempWebp);
        console.log("DEBUG - Archivo webp leído, tamaño:", stickerBuffer.length);
      } catch (readError) {
        console.error("Error al leer archivo webp:", readError);
        await sendReply("❌ Error al leer el sticker generado.");
        return;
      }
      
      // Enviar el sticker con varios intentos
      let stickerSent = false;
      
      // Primer intento - con metadatos completos
      try {
        await sendSticker(stickerBuffer, { 
          author: "Takeshi Bot", 
          pack: "Stickers", 
          keepScale: true 
        });
        stickerSent = true;
        console.log("DEBUG - Sticker enviado con metadatos completos");
      } catch (err1) {
        console.error("Error en primer intento:", err1);
        
        // Segundo intento - con metadatos mínimos
        try {
          await sendSticker(stickerBuffer, { author: "", pack: "" });
          stickerSent = true;
          console.log("DEBUG - Sticker enviado con metadatos mínimos");
        } catch (err2) {
          console.error("Error en segundo intento:", err2);
          
          // Tercer intento - sin metadatos
          try {
            await sendSticker(stickerBuffer);
            stickerSent = true;
            console.log("DEBUG - Sticker enviado sin metadatos");
          } catch (err3) {
            console.error("Error en tercer intento:", err3);
          }
        }
      }
      
      // Si no se pudo enviar
      if (!stickerSent) {
        await sendReply("❌ Error al enviar el sticker. Formato posiblemente no soportado.");
      }
      
      // Limpiar archivos temporales
      try {
        if (existsSync(tempImg)) unlinkSync(tempImg);
        if (existsSync(tempWebp)) unlinkSync(tempWebp);
        console.log("DEBUG - Archivos temporales eliminados");
      } catch (cleanupError) {
        console.error("Error al limpiar archivos temporales:", cleanupError);
      }
      
    } catch (error) {
      console.error("Error general en comando sticker:", error);
      await sendReply("❌ Ocurrió un error al procesar el sticker. Inténtalo nuevamente.");
    }
  },
};