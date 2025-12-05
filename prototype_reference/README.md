# Atelier Fit Check: Proyecto de Referencia (Prueba de Concepto)

Este proyecto es una prueba de concepto (PoC) para una aplicación de prueba de ropa virtual ("Virtual Try-On") utilizando la API de Gemini. Permite a los usuarios subir una foto, generar un modelo de moda a partir de ella, probarse diferentes prendas de vestir y finalmente generar la imagen en distintas poses.

## El Valor de este Proyecto

El principal valor de "Atelier Fit Check" no reside en ser un producto final listo para producción, sino en **demostrar un flujo funcional que produce resultados de alta calidad**.

Sirve como una validación de que la tecnología y los prompts adecuados pueden crear una experiencia de prueba virtual convincente. Es una importante **fuente de inspiración y una guía práctica** para desarrollar proyectos similares, ya que prueba que el concepto y la ejecución son viables.

## Flujo Clave del Proceso

La aplicación valida el siguiente flujo de usuario, que es uno de sus activos más importantes:

1.  **Creación del Modelo**: El usuario sube una foto personal (preferiblemente de cuerpo entero, aunque también funciona con retratos). La IA la procesa para generar una imagen de un modelo profesional, con un fondo neutro y una pose estándar, conservando los rasgos y el tipo de cuerpo del usuario.
2.  **Prueba de Prenda (Virtual Try-On)**: El usuario selecciona una prenda de un armario virtual (o sube una propia). La IA superpone la prenda en el modelo generado, ajustándola de forma realista a su pose y cuerpo.
3.  **Generación de Poses**: A partir de la imagen con la prenda ya puesta, el usuario puede solicitar a la IA que genere diferentes poses fotográficas (perfil, 3/4, caminando, etc.), manteniendo la coherencia del modelo y la ropa.

## Claves para el Éxito: Prompts y Modelos

Lo más valioso de este proyecto como referencia son los modelos de IA y, sobre todo, la ingeniería de prompts utilizada para lograr los resultados deseados.

#### Modelos Utilizados

-   Este proyecto se basa principalmente en el modelo **`gemini-2.5-flash-image`** de la API de Gemini, que es altamente eficaz para tareas de generación y edición de imágenes.

#### Ingeniería de Prompts

El éxito del flujo depende en gran medida de la calidad y especificidad de los prompts. Se pueden encontrar los prompts exactos en el fichero `services/geminiService.ts`. Los aspectos más destacados son:

-   **Para la creación del modelo**: Se instruye a la IA para que actúe como un "fotógrafo de moda experto", especificando el tipo de fondo (`#f0f0f0`), la expresión facial ("neutral, profesional") y la necesidad crucial de preservar la identidad del sujeto.
-   **Para la prueba virtual**: Se establecen reglas muy estrictas como "Reemplazo completo de la prenda", "Preservar el modelo" y "Preservar el fondo", para guiar a la IA a realizar únicamente la edición deseada sin alterar otros elementos.
-   **Para la variación de poses**: Se le pide de nuevo que actúe como fotógrafo y regenere la imagen desde una perspectiva específica, insistiendo en que "la persona, la ropa y el estilo del fondo deben permanecer idénticos".

## Conclusión

Este proyecto es un excelente punto de partida. Demuestra que con un modelo de IA potente y una cuidadosa ingeniería de prompts, es posible construir flujos complejos de manipulación de imágenes que **"simplemente funcionan"** y ofrecen resultados impresionantes. Utilízalo como base para entender cómo estructurar las llamadas a la API y cómo diseñar prompts efectivos para tus propias aplicaciones creativas.
