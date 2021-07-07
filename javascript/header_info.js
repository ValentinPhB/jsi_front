
async function start() {
    let image = document.createElement('img');
    let movieTitle = document.createElement('h2');

    let div = document.getElementById("best_movie_img");
    let div1 = document.getElementById("title_movie");

    let res = await fetch('http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page=1');
    let data = await res.json();
    let idMovie = await data.results[0]["id"];

    let res2 = await fetch(`http://localhost:8000/api/v1/titles/${idMovie}`);
    let data2 = await res2.json();

    image.src = data2["image_url"];
    movieTitle.innerHTML = `"${data2["title"]}"`;

    div.appendChild(image);
    div1.appendChild(movieTitle);

}

window.addEventListener("load", start);