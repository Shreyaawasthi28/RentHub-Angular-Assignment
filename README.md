# RentHub – Apartment Rental Platform

RentHub is an Angular web application where landlords post apartments for rent, renters search, save favourites and send inquiries, and both sides discuss listings through comments and replies.


## Demo Credentials

Two accounts are created automatically the first time the app opens, so it can be tested straight away (they are also shown on the Login page):

| Role | Email | Password | What to try |
|---|---|---|---|
| Landlord | `landlord@renthub.com` | `Landlord@123` | Owns the 6 sample listings: edit/delete them, read inquiries on **Profile → Inquiries Received** |
| Renter | `renter@renthub.com` | `Renter@123` | Save favourites, send an inquiry, comment and reply |

You can also register a new account. All data is stored in the browser's `localStorage` (see [Data storage](#data-storage-and-authentication)).

## Bonus Features Attempted

- ✅ **Preview and Submit screen for a post** (the bonus question): the Create Post form opens a preview in the wireframe's card layout (Property Type, Number of Beds, Address, Rent, Description, Amenities, Photos) before the post is submitted, with an option to go back and edit.
- ✅ Additional extras: photo upload with a gallery, inquiries inbox, Profile page with tabs, editing and deleting your own listings, lazy-loaded routes and a responsive mobile navbar.

## Features by Requirement

### User registration and authentication
- Register and log in, with validation for required fields, email format and password length (at least 6 characters). Duplicate emails are rejected and multiple accounts are supported.
- **Auth guard** (`authGuard`) protects `/create-post`, `/edit-post/:id` and `/profile`. Logged-out users are redirected to Login.
- Only the user who posted a listing can edit or delete it. This is checked on the edit page itself, not just by hiding the button.

### Home screen
- **Carousel** of featured listings with previous/next arrows.
- **Paginated** listing grid (3 per page).
- **Sorting** by rent (low to high, high to low) and by name.
- **Search and filter** by location, a rent range (min and max, either optional) and amenities. A negative rent, or a minimum above the maximum, shows an error instead of searching.
- Quick actions on each card: **View Details** and **Mark as Favourite**.

### Show interest
- **Favourites** are saved per user and listed on the Profile page.
- **Send inquiry**: a form on the details page sends a message to the landlord. The landlord sees it under *Inquiries Received*, and the renter sees it under *Inquiries Sent*.

### Create / edit post
Follows the wireframe: property type and building name, shared property (Yes/No), street address, square feet, bedrooms, lease type, expected rent with a **Negotiable** checkbox and price mode, furnishing, **amenities checkboxes**, **vegetarian preference radio buttons**, title, description (max 1400 characters), up to 5 photos (upload or URL), and contact details.

**Form validation** is applied to every field: required fields, minimum and maximum lengths, number ranges, email and 10-digit phone formats, and the photo limit. Errors are shown inline, and Preview stays disabled until the form is valid.

### View details, comments and replies
- Full post details: photo gallery, features, amenities and landlord contact.
- Comment and reply threads (login required, 2–500 characters).

### UI
- **CSS library: Bootstrap 5.3.** It provides the grid, form controls, validation styles, buttons, cards, alerts, badges, the responsive navbar, the tabs on the Profile page and the pagination. It is themed to RentHub's green palette through Bootstrap CSS variables in `src/styles.css`. Component CSS files only add page-specific layout such as the hero, the listing cards and the photo gallery.
- Responsive from 320 px phones up to desktop, including a collapsible mobile menu.

## Technology Stack

- Angular 22 (latest CLI), standalone components, signals, built-in control flow (`@if`, `@for`, `@switch`)
- TypeScript, Angular Router with lazy-loaded routes and functional guards
- Template-driven forms (`FormsModule`)
- Bootstrap 5.3
- Vitest (via `@angular/build:unit-test`) for unit tests, ESLint (`angular-eslint`)

## Getting Started

Prerequisites: Node.js and npm.

```bash
npm install     # install dependencies
npm start       # dev server at http://localhost:4200/
npm run build   # production build in dist/rent-hub/browser
npm test        # run unit tests once
npm run lint    # lint TypeScript and templates
```

## Unit Tests

The assignment asks for tests of at least one component, one service and one module. The suite has **80 tests in 14 files**, all passing:

| Kind | Spec files |
|---|---|
| **Components** | `home`, `login`, `register`, `create-post`, `apartment-details`, `profile`, `navbar`, `app` |
| **Services** | `auth.service`, `rent-hub.service`, `favorites.service`, `inquiry.service` |
| **Guard** | `auth-guard` |
| **Module** | `app.config.spec.ts`, see below |

**About the "module" test:** this project uses Angular's **standalone components**, the default and recommended approach since Angular 17, so it has no `NgModule`. The role of the root module is played by the application config (`app.config.ts`: providers and router setup) together with the route table (`app.routes.ts`). `app.config.spec.ts` tests them together as the application module:

- `appConfig` providers start up and register every route with the router.
- Every lazy-loaded route loads its component.
- Protected routes use the auth guard. A logged-out user navigating to `/profile` is redirected to `/login`, and a logged-in user can open the protected pages.
- Unknown URLs redirect to Home.

## Routes

| Path | Page | Login required |
|---|---|---|
| `/` | Home (carousel, search, listings) | No |
| `/login`, `/register` | Authentication | No |
| `/apartment/:id` | Details, inquiry, comments | No (to view) |
| `/create-post` | Create post with preview | Yes |
| `/edit-post/:id` | Edit your own post | Yes (owner only) |
| `/profile` | My listings, favourites, inquiries | Yes |

## Project Structure

```text
src/app/
├── components/navbar/      Shared responsive navbar
├── guards/auth-guard.ts    Route guard for protected pages
├── pages/
│   ├── home/               Carousel, search/filter, sort, pagination
│   ├── login/  register/   Authentication forms
│   ├── apartment-details/  Details, gallery, inquiry, comments
│   ├── create-post/        Create/edit form + Preview and Submit
│   └── profile/            Listings, favourites, inquiries
├── services/
│   ├── auth.service.ts       Accounts, login state (signal), demo accounts
│   ├── rent-hub.service.ts   Listings: sample + posted, by owner, delete
│   ├── favorites.service.ts  Per-user favourites
│   └── inquiry.service.ts    Inquiries to landlords
├── app.config.ts           Application providers (router setup)
└── app.routes.ts           Routes, lazy loading, guards
```

## Data Storage and Authentication

This is a frontend-only assignment, so all data (accounts, listings, favourites, inquiries, comments) is stored in the browser's `localStorage`:

- Data stays in the current browser and is not shared between devices or users on different machines.
- Passwords are stored in plain text in `localStorage`. This is acceptable only for a demo. A real deployment would use a backend with hashed passwords and token-based sessions.
- Uploaded photos are resized before saving, but `localStorage` is limited to about 5 MB per site. If saving fails, the form asks you to remove some photos.
- To reset the app, clear the site data in your browser. The demo accounts are recreated automatically.
