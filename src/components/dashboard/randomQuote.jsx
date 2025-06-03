export default async function RandomQuote() {
    const res = await fetch(`https://zenquotes.io/api/random`, {
        next: { revalidate: 3600 } // Revalidate every 3660 seconds
    });

    if (!res.ok) {
        throw new Error('Failed to fetch random quote');
    }

    const data = await res.json()
    const quote = data[0].q;
    const author = data[0].a;

    return (
        <div className=" p-4">
            <p className="text-gray-700 dark:text-gray-300">{quote}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">— {author}</p>
        </div>
    );
}