# Make hreemka.web@gmail.com an admin

The account `hreemka.web@gmail.com` exists and is confirmed, but currently only has the `customer` role, so `/admin` is blocked for it.

## Change

Grant that account the `admin` role by adding one row to the roles table (customer role stays as-is; it's harmless).

After that, signing in with that email and going to `/admin` gives full dashboard access.

## Technical detail

Insert into `public.user_roles`: `user_id = fbd36ccc-6f59-460c-95ce-d22095a26827`, `role = 'admin'`, using `ON CONFLICT DO NOTHING`.
