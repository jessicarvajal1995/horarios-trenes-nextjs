# app-trenes-next

Aplicacion Next.js para consultar trenes de SOFSE desde Vercel.

```sh
npm install
npm run dev
```

El front consume `/api/trenes/*`. Esa ruta corre del lado servidor y hace de proxy autenticado hacia `https://api-servicios.sofse.gob.ar/v1`.
