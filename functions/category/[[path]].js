const headers = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow"
};

export function onRequest() {
  return new Response("This legacy game category route is no longer available.", {
    status: 410,
    headers
  });
}
