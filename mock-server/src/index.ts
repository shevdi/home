import express, { type Request, type Response } from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const PORT = parseInt(process.env.PORT || '3004', 10);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ---------------------------------------------------------------------------
// In-memory file entry store
// ---------------------------------------------------------------------------

type FileEntry = {
  id: number;
  name: string;
  file_name: string;
  mime: string;
  file_size: number;
  parent_id: number;
  type: string;
  extension: string;
  public: boolean;
  workspace_id: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
  path: string;
  hash: string;
  url: string;
};

let nextId = 100;
let entries: FileEntry[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used for cache-busting simulation
let requestCounter = 0;

function createEntry(name: string, parentId: number = 1): FileEntry {
  const id = nextId++;
  return {
    id,
    name,
    file_name: name,
    mime: 'image/jpeg',
    file_size: 1024,
    parent_id: parentId,
    type: 'file',
    extension: 'jpg',
    public: false,
    workspace_id: 1,
    owner_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    path: `/${parentId}/${name}`,
    hash: `mock-hash-${id}`,
    url: `https://placehold.co/600x400?text=photo-${id}`,
  };
}

function resetStore() {
  nextId = 100;
  entries = [
    createEntry('seed-photo-1.jpg'),
    createEntry('seed-photo-2.jpg'),
    createEntry('seed-photo-3.jpg'),
  ];
}

resetStore();

// ---------------------------------------------------------------------------
// Drime: POST /auth/login
// ---------------------------------------------------------------------------

app.post('/auth/login', (_req: Request, res: Response) => {
  res.json({
    data: {
      user: {
        access_token: 'mock-access-token',
      },
    },
  });
});

// ---------------------------------------------------------------------------
// Drime: GET /drive/file-entries
// ---------------------------------------------------------------------------

app.get('/drive/file-entries', (req: Request, res: Response) => {
  const perPage = parseInt((req.query.perPage as string) || '10', 10);
  const page = parseInt((req.query.page as string) || '1', 10);

  const start = (page - 1) * perPage;
  const pageData = entries.slice(start, start + perPage);
  const lastPage = Math.max(1, Math.ceil(entries.length / perPage));

  res.json({
    data: pageData.map((e) => ({ id: e.id, url: e.url })),
    meta: { last_page: lastPage, current_page: page },
  });
});

// ---------------------------------------------------------------------------
// Drime: GET /file-entries/:id
// ---------------------------------------------------------------------------

app.get('/file-entries/:id', (req: Request, res: Response): void => {
  requestCounter++;
  const id = parseInt(req.params.id, 10);
  const entry = entries.find((e) => e.id === id);
  const baseUrl = entry?.url ?? `https://placehold.co/600x400?text=photo-${id}`;
  res.redirect(`${baseUrl}&v=${id}`);
});

// ---------------------------------------------------------------------------
// Drime: POST /uploads
// ---------------------------------------------------------------------------

const upload = multer({ storage: multer.memoryStorage() });

app.post('/uploads', upload.single('file'), (req: Request, res: Response) => {
  const parentId = parseInt((req.body?.parentId as string) || '1', 10);
  const fileName = (req.file?.originalname as string) || 'upload.jpg';
  const entry = createEntry(fileName, parentId);
  entries.push(entry);

  res.json({ fileEntry: entry });
});

// ---------------------------------------------------------------------------
// Drime: POST /file-entries/delete
// ---------------------------------------------------------------------------

app.post('/file-entries/delete', (req: Request, res: Response) => {
  const entryIds: string[] = req.body?.entryIds || [];
  const idSet = new Set(entryIds.map((id) => parseInt(id, 10)));
  entries = entries.filter((e) => !idSet.has(e.id));
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// DaData: POST /suggestions/api/4_1/rs/geolocate/address
// ---------------------------------------------------------------------------

app.post('/suggestions/api/4_1/rs/geolocate/address', (_req: Request, res: Response) => {
  res.json({
    suggestions: [
      {
        value: 'г Москва, ул Тверская, д 1',
        unrestricted_value: 'Россия, г Москва, ул Тверская, д 1',
        data: {
          country: 'Россия',
          country_iso_code: 'RU',
          region: 'Москва',
          city: 'Москва',
          settlement: null,
          street: 'Тверская',
          house: '1',
        },
      },
    ],
  });
});

// ---------------------------------------------------------------------------
// Nominatim: GET /reverse
// ---------------------------------------------------------------------------

app.get('/reverse', (_req: Request, res: Response) => {
  res.json({
    place_id: 123456,
    licence: 'mock',
    osm_type: 'way',
    osm_id: '12345',
    lat: '55.7558',
    lon: '37.6173',
    display_name: 'Тверская улица, Москва, Россия',
    address: {
      road: 'Тверская улица',
      city: 'Москва',
      state: 'Москва',
      country: 'Россия',
      country_code: 'ru',
    },
    boundingbox: ['55.755', '55.756', '37.617', '37.618'],
  });
});

// ---------------------------------------------------------------------------
// Reset endpoint (for test isolation)
// ---------------------------------------------------------------------------

app.post('/__reset', (_req: Request, res: Response) => {
  resetStore();
  requestCounter = 0;
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});
