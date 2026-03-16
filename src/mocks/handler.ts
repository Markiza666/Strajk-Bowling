import { http, HttpResponse } from 'msw';

export const handlers = [
    http.post('https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking', () => {
        return HttpResponse.json({
            bookingId: "STR12345",
            when: "2026-05-20T18:00",
            lanes: "1",
            people: "2",
            price: 340,
            active: true
        });
    }),
];
