## ADDED Requirements

### Requirement: Desktop-first installed PWA

The client SHALL be installable as a Progressive Web App. The primary supported shell SHALL be the **installed** application running in **standalone** `display-mode` on **desktop** browsers (e.g. Chrome/Edge on Windows).

#### Scenario: Standalone display mode

- **WHEN** the user opens the application from an installed PWA shortcut or start-menu entry
- **THEN** the application SHALL run in standalone display mode suitable for desktop use (not a minimal browser chrome frame)

#### Scenario: Install is the product default

- **WHEN** documentation or in-app guidance describes how to use the app on desktop
- **THEN** it SHALL describe installation as the expected way to run the client in v1

### Requirement: Layered network and load pipeline for photos

For **photo** resources, the system SHALL apply a **layered** pipeline in order: (1) **fast offline** using `navigator.onLine`; (2) **fetch** to verify reachability of the resource; (3) **service worker cache** fallback when fetch fails but a cached response exists.

#### Scenario: Fast offline short-circuit

- **WHEN** `navigator.onLine` is `false`
- **THEN** the system SHALL treat the session as fully offline for photo-slot purposes without waiting for network timeouts

#### Scenario: Fetch when browser reports online

- **WHEN** `navigator.onLine` is `true`
- **THEN** the system SHALL attempt to obtain the photo via fetch (or an equivalent mechanism that participates in the service worker) before concluding failure

#### Scenario: Service worker cache after failed fetch

- **WHEN** `navigator.onLine` is `true` and fetch does not return a usable photo response
- **THEN** the system SHALL attempt to satisfy the photo from the service worker cache when a matching cached entry exists

### Requirement: Photo slot messages for offline vs load failure

Photo slots SHALL display user-visible text that distinguishes **fully offline** from **online (or lie-fi) but image unavailable** after the layered pipeline.

#### Scenario: Fully offline

- **WHEN** the layered pipeline determines the user is fully offline (including the fast `navigator.onLine === false` path)
- **THEN** each affected photo slot SHALL show **«Нет интернета»** instead of the image

#### Scenario: Load failure not attributable to full offline

- **WHEN** the user is not fully offline per the pipeline but the photo cannot be displayed after fetch and cache fallback
- **THEN** the photo slot SHALL show **«Не удалось загрузить фото»**

#### Scenario: Lie-fi does not use offline copy

- **WHEN** `navigator.onLine` is `true` but the photo cannot be loaded
- **THEN** the photo slot SHALL NOT show **«Нет интернета»** solely because of that failure; it SHALL show **«Не удалось загрузить фото»** (or a successfully cached image if the pipeline resolves one)

### Requirement: Background photo caching without changing v1 offline UI

When the user is online, the system SHALL cache photo responses in the background for future use. In v1, **offline** photo slots SHALL still show **«Нет интернета»** only, even if cached photo data exists from earlier online sessions.

#### Scenario: Offline UI unchanged by prior cache

- **WHEN** the user is fully offline
- **THEN** photo slots SHALL show **«Нет интернета»** and SHALL NOT display cached images from prior sessions in v1

### Requirement: No photo uploads in v1

The application SHALL NOT offer working user-facing **photo upload** flows in v1, including when online.

#### Scenario: No upload affordance

- **WHEN** the user navigates the v1 application
- **THEN** the user SHALL NOT be able to complete a photo upload action (controls SHALL be absent or disabled such that upload is impossible)

### Requirement: Global offline warning toast

While the browser reports **fully offline** (`navigator.onLine === false`), the application SHALL show a single **app-wide** toast using the **warning** variant. The toast SHALL **not** include a **close** or **dismiss** control (no close button). The toast SHALL remain visible for the duration of the offline state and SHALL **not** be shown when the browser reports online.

#### Scenario: Offline shows warning toast

- **WHEN** `navigator.onLine` is `false`
- **THEN** the application SHALL display a warning toast that applies across the current session shell (not only a single route or feature)

#### Scenario: No dismiss control on offline toast

- **WHEN** the offline warning toast is visible
- **THEN** it SHALL NOT expose a user control whose primary purpose is to dismiss or hide that toast (e.g. no close button)

#### Scenario: Online hides toast

- **WHEN** `navigator.onLine` becomes `true`
- **THEN** the offline warning toast SHALL no longer be shown

### Requirement: Connection restored success toast

**WHEN** the browser transitions from **fully offline** to **online** (`navigator.onLine` becomes `true` after it was `false`), the application SHALL show a single **success** variant toast whose visible text includes **Соединение восстановлено**. That toast SHALL remain visible for **10 seconds** (then dismiss per normal toast behavior unless otherwise specified).

#### Scenario: Reconnection shows success copy

- **WHEN** the user was in the fully offline state and connectivity is restored (offline → online transition)
- **THEN** the application SHALL show a success toast displaying **Соединение восстановлено**

#### Scenario: Success toast duration

- **WHEN** the connection-restored success toast is shown
- **THEN** it SHALL remain visible for **10 seconds** before auto-dismissal (or equivalent duration semantics)

### Requirement: Service worker and manifest present

The application SHALL include a **web app manifest** and a **registered service worker** that implement caching and offline shell behavior consistent with these requirements.

#### Scenario: Manifest linked

- **WHEN** the application is loaded over HTTPS (or secure localhost)
- **THEN** the document SHALL reference a valid web app manifest suitable for installation

#### Scenario: Service worker registered

- **WHEN** the user first loads the application in a supported browser
- **THEN** the client SHALL register a service worker that controls navigations and can cache assets and photo GET responses per this specification
