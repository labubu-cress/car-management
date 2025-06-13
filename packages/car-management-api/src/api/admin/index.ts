import { Hono, type Context } from "hono";
import carsAdminApi from "./features/cars";
import tenantsAdminApi from "./features/tenants/routes";

const admin = new Hono();

// Mount the cars admin API
admin.route("/cars", carsAdminApi);
admin.route("/tenants", tenantsAdminApi);

// Later, other admin features like auth, users, etc., will be mounted here.

admin.get("/", (c: Context) => c.json({ message: "Welcome to Admin API" }));

export default admin;
