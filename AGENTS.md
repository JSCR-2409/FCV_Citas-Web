# citas-web — Instrucciones del agente frontend

## Alcance y estado actual

Este repositorio implementa exclusivamente el frontend TypeScript del laboratorio. Consume `citas-api` directamente por REST; no se añade Express, BFF ni lógica de servidor alternativa.

El checkout actual no contiene `package.json`, código de aplicación, rutas, tokens de estilo ni artefactos de diseño aprobados. Por tanto, este archivo no prescribe React, Angular, gestor de paquetes, estructura de carpetas ni convenciones de CSS. Tras importar el proyecto de Google AI Studio, volver a inspeccionar y depurar estas instrucciones contra el stack real.

No editar `citas-api/` desde este agente. Si el contrato REST no cubre una necesidad, reportar el cambio cross-repo al orquestador con la evidencia necesaria; no inventar el backend ni modificarlo aquí.

## Antes de editar

1. Leer el `AGENTS.md` raíz, el PRD, las restricciones técnicas y las HU/CA/DoD aprobadas en `citas-api/docs/wiki/scrum/`.
2. Inspeccionar `package.json`, lockfile, estructura, rutas, componentes, estilos/tokens, scripts y configuración de entorno del checkout real.
3. Localizar la fuente o handoff aprobado de Stitch/Google AI Studio y usarla como fuente de verdad visual.
4. Identificar pantallas, componentes, servicios REST y rutas afectados.
5. Mapear estados `loading`, `empty`, `error`, `success` y `disabled` antes de implementar.
6. Proponer un plan con archivos, pruebas y posible impacto de contrato antes de editar.

Si no existen HU/DoD, contrato aprobado o diseño/handoff aplicable, como ocurre en el estado inicial, no inventar alcance, endpoints, pantallas ni estética. Informar la carencia y solicitar la fuente correspondiente.

## Implementación de UI

- Mantener TypeScript y el framework realmente exportado desde Google AI Studio; nunca cambiar React por Angular, ni lo contrario, por preferencia propia.
- Reconciliar el código generado sin rediseñar componentes, jerarquía visual, estilos o tokens que estén correctos frente al diseño aprobado.
- Implementar formularios, validación de experiencia de usuario, feedback de envío, accesibilidad, navegación y manejo de errores en cliente.
- Las reglas de negocio, transiciones de estado, disponibilidad y autorización efectiva pertenecen al backend. La UI puede orientar al usuario, pero no es autoridad ni sustituto de validación server-side.
- Las protecciones de ruta y la visibilidad por rol mejoran la experiencia; no deben asumirse como controles de seguridad suficientes.

## API, seguridad y configuración

- La URL de `citas-api` debe ser configurable mediante el mecanismo de environment propio del stack detectado; no fijar un nombre de variable antes de conocer React o Angular.
- Centralizar llamadas REST, tipados, errores y manejo de sesión según la estructura real del proyecto.
- No hardcodear tokens, contraseñas, secretos ni URLs sensibles; no abrir, registrar ni versionar `.env`.
- No exponer access/refresh tokens en logs, mensajes de error o estados visibles de depuración.
- Si se requiere un nuevo endpoint, cambio de DTO, CORS o semántica de autenticación, detener el cambio local y elevarlo al orquestador como cambio cross-repo.

## Verificación y entrega

- Ejecutar los comandos de build, typecheck, lint y pruebas que estén definidos en el `package.json` real.
- Verificar cada pantalla contra sus criterios de aceptación, el diseño aprobado y los estados de UI previstos.
- En el resumen, indicar HU/DoD evaluados, pantallas y servicios afectados, comandos ejecutados y resultados; separar lo verificado de lo pendiente.

## Git y documentación

- `main` es estable y `develop` es la rama de trabajo. Si `develop` no existe, no trabajar en `main`; solicitar o recibir autorización para preparar la línea de trabajo.
- Preservar cambios ajenos y no reescribir historial.
- No mantener una LLM Wiki propia ni modificar la Wiki global como parte de una tarea frontend.
