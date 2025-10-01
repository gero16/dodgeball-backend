# 📧 Configuración de Emails para Formulario de Contacto

## ¿Cómo funciona?

Cuando un usuario completa el formulario de contacto:
1. El mensaje se **guarda en MongoDB**
2. Se **envía un email de notificación** al destinatario configurado
3. El usuario recibe confirmación de que su mensaje fue enviado

## 📋 Variables de entorno necesarias

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo_personal@gmail.com          # Tu correo que ENVÍA
EMAIL_PASS=abcd efgh ijkl mnop                   # Contraseña de aplicación
EMAIL_RECIPIENT=dodgeballuruguay@gmail.com       # Correo que RECIBE
```

### Explicación:
- **EMAIL_USER**: Tu correo personal (tienes control total)
- **EMAIL_PASS**: Contraseña de aplicación de Gmail (NO tu contraseña normal)
- **EMAIL_RECIPIENT**: El correo del cliente que recibirá las notificaciones

## 🔧 Configuración paso a paso

### 1. Configurar tu cuenta de Gmail (EMAIL_USER)

**a) Activar verificación en 2 pasos:**
1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en 2 pasos"
3. Actívala (sigue los pasos de Google)

**b) Crear contraseña de aplicación:**
1. Ve a: https://myaccount.google.com/apppasswords
2. Nombre: "Dodgeball Backend"
3. Clic en "Crear"
4. **Copia la contraseña de 16 caracteres** (ejemplo: `abcd efgh ijkl mnop`)
5. Esta es tu `EMAIL_PASS`

### 2. Configurar en Railway (Producción)

En el dashboard de Railway:
1. Ve a tu proyecto backend
2. Clic en "Variables"
3. Agrega las siguientes variables:

```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = tu_correo_personal@gmail.com
EMAIL_PASS = abcd efgh ijkl mnop
EMAIL_RECIPIENT = dodgeballuruguay@gmail.com
```

4. Railway reiniciará automáticamente el backend

### 3. Configurar en local (Desarrollo) - Opcional

Crea un archivo `.env` en `dodgeball-backend/`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dodgeball-club
JWT_SECRET=mi_jwt_secret_para_desarrollo
FRONTEND_URL=http://localhost:5173

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo_personal@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_RECIPIENT=dodgeballuruguay@gmail.com
```

## 📨 ¿Qué recibirá el destinatario?

El email tendrá este formato:

```
Asunto: Nuevo mensaje de contacto: [Asunto del usuario]

Nuevo mensaje de contacto desde la web

Nombre: Juan Pérez
Email: juan@example.com
Teléfono: +598 99 123 456
Tipo: consulta
Asunto: Consulta sobre entrenamientos

-------------------
Mensaje:
Hola, me gustaría saber más sobre los entrenamientos...
-------------------

Para responder, simplemente responde a este email o escribe a: juan@example.com
```

## ✅ Ventajas de esta configuración:

- ✅ **Control total**: Usas tu propio correo para enviar
- ✅ **Seguridad**: Tu contraseña de Gmail permanece segura
- ✅ **Flexibilidad**: Puedes cambiar el destinatario sin cambiar el remitente
- ✅ **Reply-To**: El cliente puede responder directamente al usuario
- ✅ **Respaldo**: Todos los mensajes se guardan en MongoDB

## 🧪 Probar el sistema

### Opción 1: Probar en local
```bash
cd dodgeball-backend
# Asegúrate de tener el .env configurado
node src/index.js
```

### Opción 2: Probar en producción
Simplemente completa el formulario en:
https://dodgeball-kappa.vercel.app/contacto

## ❓ Preguntas frecuentes

**P: ¿Por qué necesito una "Contraseña de aplicación"?**
R: Google no permite usar tu contraseña normal por seguridad. Las contraseñas de aplicación son más seguras.

**P: ¿Puedo usar otro proveedor de email (no Gmail)?**
R: Sí, solo cambia EMAIL_HOST y EMAIL_PORT. Por ejemplo:
- Outlook: smtp-mail.outlook.com, puerto 587
- Yahoo: smtp.mail.yahoo.com, puerto 587

**P: ¿Qué pasa si no configuro los emails?**
R: El formulario seguirá funcionando y los mensajes se guardarán en MongoDB, solo no se enviarán notificaciones por email.

**P: ¿Puedo usar el mismo correo para enviar y recibir?**
R: Sí, simplemente usa el mismo email en EMAIL_USER y EMAIL_RECIPIENT.
