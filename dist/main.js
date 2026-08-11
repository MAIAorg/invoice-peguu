"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('API Universal de Facturación CFDI 4.0 - Peguu & MagenttaOne')
        .setDescription('Microservicio REST de sellado digital RSA-SHA256, timbrado SAT y administración CSD.')
        .setVersion('1.0')
        .addTag('Facturación', 'Endpoints de timbrado individual, masivo por lote, cancelación y folios')
        .addTag('Configuración CSD', 'Endpoints de administración y encriptación AES-256-GCM de certificados')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map