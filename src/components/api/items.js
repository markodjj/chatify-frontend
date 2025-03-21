const items = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));
  
  const LIMIT = 10;
  
  export function fetchItems({ pageParam, mrk }) {
    console.log(pageParam);
    console.log(mrk);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: items.slice(pageParam, pageParam + LIMIT),
          currentPage: pageParam,
          nextPage: pageParam + LIMIT < items.length ? pageParam + LIMIT : null,
        });
      }, 1000);
    });
  }
  