# ⚡ Peguu Billing API - Microservicio de Facturación Electrónica SAT CFDI 4.0

Microservicio REST de alto rendimiento diseñado para la emisión, timbrado oficial, generación de archivos PDF vectoriales con diseño oficial Peguu y almacenamiento seguro de comprobantes fiscales digitales por internet (**CFDI versión 4.0**) para las plataformas de **Peguu**.

---

## 📋 1. Requisitos del Sistema

- **Node.js:** Versión `18.x` o `20.x` LTS (Recomendada `^20.12.0` o superior).
- **NPM:** Versión `9.x` o superior.
- **Memoria RAM Mínima:** 512 MB (Recomendado 1 GB).
- **Sistema Operativo:** Linux (Ubuntu 20.04+, Debian, CentOS, AlmaLinux) o Windows Server.

---

## 🚀 2. Guía Rápida de Instalación y Despliegue

### Paso 1: Instalación de Dependencias
En el directorio raíz del proyecto:
```bash
npm install --production
```

### Paso 2: Configuración de Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Edita `.env` con tus parámetros de servidor y credenciales del PAC Diverza:
```env
PORT=3000
NODE_ENV=production
ENCRYPTION_KEY=peguu-prod-master-key-security-2026-secret-vault-key

# Credenciales de Diverza PAC
DIVERZA_CLIENT_ID=tu_client_id_diverza
DIVERZA_TOKEN=tu_token_diverza
DIVERZA_STAMP_URL=https://servicios.diverza.com/api/v2/documents/stamp
DIVERZA_CANCEL_URL=https://servicios.diverza.com/api/v2/documents/UUID/cancel

# Directorio de almacenamiento de certificados y folios
CSD_STORAGE_PATH=./storage
```

### Paso 3: Iniciar el Microservicio

#### Opción A: Modo Producción Estándar
```bash
npm run start:prod
```

#### Opción B: Con Gestor de Procesos PM2 (Recomendado)
```bash
npm install -g pm2
pm2 start dist/main.js --name "peguu-billing-api"
pm2 save
pm2 startup
```

El microservicio quedará activo y escuchando peticiones en:
👉 `http://localhost:3000` (o el puerto configurado en `.env`).

---

## ⚙️ 3. Configuración Inicial del Emisor y CSD

La API permite registrar la configuración fiscal del Emisor de forma programática mediante endpoints REST:

### A) Configurar Datos Fiscales del Emisor
`POST /api/v1/facturas/configurar-emisor`
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

### B) Cargar Certificados de Sello Digital (CSD)
`POST /api/v1/facturas/configurar-csd`
> Envía los archivos `.cer` y `.key` codificados en Base64 junto con su contraseña. La API los almacena de forma encriptada bajo el estándar **AES-256-GCM**.
```json
{
  "rfc": "IVD920810GU2",
  "cer_base64": "MIIF5zCCA8+gAwIBAgIUMzAwMDEwMDAwMDA1MDAwMDM0MzQwDQYJKoZIhvcNAQELBQAw...",
  "key_base64": "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7r6K0vL6e5N...",
  "password_csd": "12345678a"
}
```

### C) Configurar Serie y Folio Consecutivo
`POST /api/v1/facturas/configurar-folios`
```json
{
  "rfc": "IVD920810GU2",
  "serie": "PGU",
  "siguiente_folio": 1
}
```

### D) Configurar Credenciales del PAC Diverza (Sin tocar .env)
`POST /api/v1/facturas/configurar-pac`
```json
{
  "client_id": "tu_client_id_diverza",
  "token": "tu_token_diverza",
  "stamp_url": "https://servicios.diverza.com/api/v2/documents/stamp",
  "cancel_url": "https://servicios.diverza.com/api/v2/documents/UUID/cancel"
}
```

---

## 📡 4. Endpoints Principales de Facturación

### 🟢 Timbrado de Factura CFDI 4.0 (Ingreso)
`POST /api/v1/facturas/timbrar`

#### Request Body (JSON):
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

#### Response Exitosa (200 OK):
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

### 📄 Descarga de Archivo Binario PDF (.pdf)
- **Por UUID:** `GET /api/v1/facturas/:uuid/pdf` (Retorna el binario con `Content-Type: application/pdf`).
- **Por Payload:** `POST /api/v1/facturas/descargar-pdf` (Genera y descarga el archivo binario `.pdf`).

---

### 🔴 Cancelación de Comprobantes ante el SAT
`POST /api/v1/facturas/cancelar`

```json
{
  "uuid": "5a5a40eb-dbff-41b8-941e-2788678cc6b2",
  "motivo": "02",
  "folio_sustitucion": ""
}
```

---

### 📦 Timbrado Masivo por Lotes
`POST /api/v1/facturas/timbrar-lote`

Permite enviar múltiples facturas en una sola petición HTTP para procesamientos masivos de órdenes de venta.

---

## 🔒 5. Seguridad y Respaldos

1. **Llaves Criptográficas:** Las llaves privadas CSD se almacenan encriptadas con **AES-256-GCM** en el directorio local `./storage`.
2. **Control de Folios:** Cada factura timbrada con éxito avanza el consecutivo estrictamente en +1 (`1 ➔ 2 ➔ 3...`).
3. **Respaldo Recomendado:** Realizar respaldos periódicos de la carpeta `./storage` donde residen los datos de folios y certificados.

---
© 2026 Peguu. Todos los derechos reservados.
