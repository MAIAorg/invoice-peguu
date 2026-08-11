# 📘 Manual de Instalación y Puesta en Marcha
## Peguu Billing API - Microservicio CFDI 4.0

Este documento describe el procedimiento paso a paso para desplegar e integrar el microservicio de facturación electrónica de **Peguu** en servidores de producción (Linux o Windows Server).

---

## 📋 1. Requisitos Previos del Servidor

El servidor donde se instalará el microservicio debe contar con:
- **Node.js:** Versión `18.x` o `20.x` LTS (Verificar con `node -v`).
- **NPM:** Incluido con Node.js (Verificar con `npm -v`).
- **Acceso a Internet:** Salida HTTPS por el puerto `443` hacia el PAC Diverza (`servicios.diverza.com`).

---

## 🚀 2. Instalación Paso a Paso

### Paso 1: Descomprimir el Entregable
Coloca y descomprime el archivo `peguu-one-api-v1.0.0.zip` en la carpeta de destino del servidor.
- **En Linux (ejemplo):** `/var/www/peguu-billing-api`
- **En Windows (ejemplo):** `C:\servicios\peguu-billing-api`

---

### Paso 2: Instalar Dependencias de Producción
Abre una terminal de comandos en la carpeta del proyecto y ejecuta:
```bash
npm install --production
```
> *Este comando descargará e instalará únicamente los módulos necesarios en unos segundos.*

---

### Paso 3: Configurar Variables de Entorno (`.env`)
1. Crea una copia del archivo `.env.example` y nómbrala `.env`:
   - **Linux:** `cp .env.example .env`
   - **Windows:** `copy .env.example .env`

2. Abre el archivo `.env` con tu editor de texto y completa los datos:
```env
# Puerto donde escuchará el microservicio
PORT=3000
NODE_ENV=production

# Llave maestra para encriptar los certificados CSD en disco (puedes dejar la que viene)
ENCRYPTION_KEY=peguu-prod-master-key-security-2026-secret-vault-key

# Credenciales oficiales proporcionadas por Diverza PAC
DIVERZA_CLIENT_ID=tu_client_id_diverza
DIVERZA_TOKEN=tu_token_diverza
DIVERZA_STAMP_URL=https://servicios.diverza.com/api/v2/documents/stamp
DIVERZA_CANCEL_URL=https://servicios.diverza.com/api/v2/documents/UUID/cancel

# Carpeta donde se almacenarán los folios y certificados encriptados
CSD_STORAGE_PATH=./storage
```

---

### Paso 4: Iniciar el Microservicio

#### Opción Recomendada: Con PM2 (Gestor de Procesos en Segundo Plano)
Permite que la API arranque automáticamente al encender el servidor y se reinicie en caso de fallos:
```bash
# 1. Instalar PM2 globalmente (si no lo tienes)
npm install -g pm2

# 2. Iniciar el microservicio
pm2 start dist/main.js --name "peguu-billing-api"

# 3. Guardar la configuración para inicio automático
pm2 save
pm2 startup
```

#### Opción Alternativa: Arranque Directo con Node
```bash
npm run start:prod
```

✅ **Verificación:** El microservicio estará activo y listo para recibir peticiones en:  
`http://localhost:3000` (o el puerto configurado).

---

## ⚙️ 3. Configuración Inicial del Emisor (Se realiza una sola vez)

Antes de emitir la primera factura, se deben registrar los datos fiscales y los certificados del Emisor mediante **3 peticiones HTTP POST** (puedes ejecutarlas desde Postman, cURL o tu backend):

### 1) Registrar Datos Fiscales del Emisor
`POST http://localhost:3000/api/v1/facturas/configurar-emisor`
```json
{
  "rfc": "IVD920810GU2",
  "razon_social": "INNOVACION VALOR Y DESARROLLO SA",
  "nombre_comercial": "PEGUU",
  "regimen_fiscal": "601",
  "domicilio": {
    "calle": "HIDALGO",
    "no_exterior": "345",
    "colonia": "CENTRO",
    "municipio": "TEPIC",
    "estado": "NAYARIT",
    "codigo_postal": "63000",
    "pais": "MÉXICO"
  }
}
```

---

### 2) Cargar Certificados de Sello Digital (CSD)
`POST http://localhost:3000/api/v1/facturas/configurar-csd`
> *Los archivos `.cer` y `.key` del CSD se envían codificados en Base64. El sistema los encripta con AES-256 en disco.*
```json
{
  "rfc": "IVD920810GU2",
  "cer_base64": "MIIGVzCCBD+gAwIBAgIUMzAwMDEwMDAwMDA1MDAwMDM0MzQwDQYJKoZIhvcNAQELBQAw...",
  "key_base64": "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...",
  "password_csd": "tu_password_del_csd"
}
```

---

### 3) Configurar Serie y Folio Inicial
`POST http://localhost:3000/api/v1/facturas/configurar-folios`
```json
{
  "rfc": "IVD920810GU2",
  "serie": "PGU",
  "siguiente_folio": 1
}
```

---

## 🧾 4. Cómo Timbrar una Factura desde tu Tienda / Sistema

Para generar y timbrar una factura de venta, envía una petición POST al endpoint de timbrado:

### Endpoint:
`POST http://localhost:3000/api/v1/facturas/timbrar`

### Body (JSON):
```json
{
  "origen": "peguu_tienda",
  "receptor": {
    "rfc": "IXS7607092R5",
    "razon_social": "INTERNACIONAL XIMBO Y SABORES SA DE CV",
    "codigo_postal": "63000",
    "regimen_fiscal": "601",
    "uso_cfdi": "G03",
    "email": "facturas@ximbo.com"
  },
  "comprobante": {
    "tipo_comprobante": "I",
    "forma_pago": "04",
    "metodo_pago": "PUE",
    "moneda": "MXN",
    "subtotal": 8038.54,
    "total": 9324.71,
    "conceptos": [
      {
        "clave_prod_serv": "55121715",
        "cantidad": 2000,
        "clave_unidad": "H87",
        "descripcion": "Holográfico - etiquetas Peguu",
        "valor_unitario": 4.01927,
        "importe": 8038.54
      }
    ]
  }
}
```

### Respuesta Exitosa (HTTP 200 OK):
```json
{
  "status": "STAMPED",
  "uuid": "5a5a40eb-dbff-41b8-941e-2788678cc6b2",
  "fecha": "2026-08-01T13:59:05",
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><cfdi:Comprobante ...",
  "pdfBase64": "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDw...",
  "pdfContent": "<!DOCTYPE html><html>...</html>"
}
```

---

## 📥 5. Descarga de Archivos PDF y XML

- **Descargar PDF Binario por UUID:**  
  `GET http://localhost:3000/api/v1/facturas/{UUID}/pdf`  
  *(Devuelve el archivo binario `.pdf` con `Content-Type: application/pdf` para guardar o abrir en el navegador).*

- **Cancelar Factura ante el SAT:**  
  `POST http://localhost:3000/api/v1/facturas/cancelar`  
  Body: `{"uuid": "5a5a40eb-...", "motivo": "02"}`

---

## 💾 6. Política de Respaldos

Toda la información configurada (folios consecutivos y certificados encriptados) reside en la carpeta:
👉 **`./storage`**

Para respaldar la configuración del sistema, simplemente incluye la carpeta `storage/` en tus rutinas de backup periódicas.

---
**Peguu Tech Team © 2026**
