const getUserStats =  async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluations`);
    return res.json();
}