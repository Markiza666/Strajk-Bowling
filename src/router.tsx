import { createBrowserRouter } from "react-router-dom";
import Booking from "./views/booking/Booking";
import Confirmation from "./views/confirmation/Confirmation";


const router = createBrowserRouter([
    {
        path: '/',
        element: <Booking />,
    },
    {
        path: '/confirmation',
        element: <Confirmation />,
    },
]);

export default router;