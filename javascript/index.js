/**
  * Collect all information required for header ( image, title and description of the "best movie".)
   */
async function createHeader(url) {
    let image = document.createElement('img');
    let movieTitle = document.createElement('h2');
    let resume = document.createElement('h3');

    let div = document.querySelector('.best-movie__img');
    let div1 = document.querySelector(".best-movie__title");
    let div2 = document.querySelector(".best-movie__resume");

    let response = await fetch(url);
    let data = await response.json();
    let idMovie = await data.results[0]["id"];

    let response2 = await fetch(`http://localhost:8000/api/v1/titles/${idMovie}`);
    let data2 = await response2.json();

    image.src = data2["image_url"];
    image.alt = `affiche du film '${data2["title"]}'.`;
    image.setAttribute('id', (data2["id"]));
    image.setAttribute("class", "forModal");
    movieTitle.innerHTML = `"${data2["title"]}"`;
    resume.innerHTML = `"${data2["long_description"]}"`;

    div.appendChild(image);
    div1.appendChild(movieTitle);
    div2.appendChild(resume);
}

// Carousels;
class Carousel {

  /**
   *  This callback type is called `moveCallback` and is displayed as a global symbol.
   * @callback moveCallback
   * @param {number} index 
   */

  /**
 *  @param {HTMLElement} element
 *  @options {Object} [options.slidesToScroll=1] Number of elements to scroll.
 *  @options {Object} [options.slidesVisible=1] Number of element visible.
 *  @options {boolean} [options.loop=false] Loop at the beginning or the end of the carousel ?
 */
  constructor (element, options = {}) {
    this.element = element;
    this.options = Object.assign({}, {
      slidesToScroll: 1,
      slidesVisible: 1,
      loop: false
    }, options);
    let children = [].slice.call(element.children);
    this.isMobile = false;
    this.movesCallbacks = [];
    this.currentItem = 0;

    // Edit DOM;
    this.root = this.createDivWithClass('carousel');
    this.container = this.createDivWithClass('carousel__container');
    this.root.setAttribute('tabIndex','0') ;     
    this.root.appendChild(this.container);
    this.element.appendChild(this.root);
    this.items = children.map((child)  => {
      let item = this.createDivWithClass('carousel__item');
      item.appendChild(child);
      this.container.appendChild(item);
      return item;
    });
    this.setStyle();
    this.createNavigation();

    // Events
    this.movesCallbacks.forEach(cb => cb(0));
    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.root.addEventListener('keyup', e => {
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        this.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        this.prev();
      }

    });
  }

  /**
   * @param {string} className 
   * @returns {HTMLElement}
   */
  createDivWithClass (className) {
    let div = document.createElement('div');
    div.setAttribute('class', className);
    return div;
  }

  /**
   * Apply the correct size to all items of the carousel.
   */
  setStyle () {
    let ratio = this.items.length / this.slidesVisible;
    this.container.style.width = (ratio * 100) + "%";
    this.items.forEach(item  => item.style.width = ((100 / this.slidesVisible ) / ratio) + '%' );

  }
  /**
   * Arrows and navigation.
   */
  createNavigation () {
    let nextButton = this.createDivWithClass('carousel__next');
    let prevButton = this.createDivWithClass('carousel__prev');
    this.root.appendChild(nextButton);
    this.root.appendChild(prevButton);
    nextButton.addEventListener('click', this.next.bind(this) );
    prevButton.addEventListener('click', this.prev.bind(this) );
    if (this.options.loop === true) {
      return;

    }
    // Hide arrows if there are not necessary.
    this.onMove(index => {
      if (index === 0) {
        prevButton.classList.add('carousel__prev--hidden');
      } else {
        prevButton.classList.remove('carousel__prev--hidden');
      } 
      if (this.items[this.currentItem + this.slidesVisible] === undefined) {
        nextButton.classList.add('carousel__next--hidden');
      } else {
        nextButton.classList.remove('carousel__next--hidden');
      }
    });
  }

  /**
   * Function "next" for arrow
   */
  next() {
    if ((this.currentItem + this.slidesToScroll) <= this.items.length) {
      this.goToItem(this.currentItem + this.slidesToScroll);
    } else if ((this.currentItem + this.slidesToScroll) > this.items.length) {
      this.goToItem(this.currentItem + 1);
    }
  }

  /**
   * Function "next" for arrow
   */
  prev() {
    if ((this.currentItem - this.slidesToScroll) < 0) {
      this.goToItem(this.currentItem - 1);
    } else if ((this.currentItem - this.slidesToScroll) >= 0) {
      this.goToItem(this.currentItem - this.slidesToScroll);
    }
  }

  /**
   * Move the carousel to chosen element.
   * @param {number} index of current item.
   */
  goToItem (index) {
    if (index < 0 ) {
      if (this.options.loop) {
      index = this.items.length - this.slidesVisible;
    } else {
      return;
      }
    } else if (index >= this.items.length || (this.items[this.currentItem + this.slidesVisible] === undefined && 
      index > this.currentItem)) {
        if (this.options.loop) {
          index = 0;
    } else {
      return;
      }
    }
    let translateX = index * -100 / this.items.length;
    this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)';
    this.currentItem = index;
    this.movesCallbacks.forEach(cb => cb(index));
  }

  /**
   * @param {moveCallback} cb
   */
  onMove (cb) {
    this.movesCallbacks.push(cb);
  }

  /**
   * Switch to default value for slideToScroll and slidesVisible for mobiles.
   */
  onWindowResize () {
    let mobile = window.innerWidth < 800;
    if (mobile !== this.isMobile) {
      this.isMobile = mobile;
      this.setStyle();
      this.movesCallbacks.forEach(cb => cb(this.currentItem));
    }
  }

  /**
   * @returns {number} For responsive design.
   */
  get slidesToScroll () {
    return this.isMobile ? 1 : this.options.slidesToScroll;
  }

  /**
   * @returns {number} For responsive design.
   */
  get slidesVisible () {
    return this.isMobile ? 1 : this.options.slidesVisible;
  }
}

/**
   * Main function to create carousels.
   * @param {string} base url.
   * @param {string} carousel id of carousel.
   */
async function displayCarousel (base, carousel) {
  const arrayUrls = await createArrayUrls(base);
  try {
  // Promise.all(array)
    const results = await Promise.all([
      fetch(arrayUrls[0]),
      fetch(arrayUrls[1]),
        fetch(arrayUrls[2])
        ]);
    const dataPromise =  results.map(result => result.json());
    const finalData = await Promise.all(dataPromise);
    await createElementsCarousel(finalData, carousel);
    await newInstanceCarousel(carousel);
  } catch(e) {
    console.error(e);
  }
}

/**
   * Step one; Create an array with all urls "to fetch" them.
   * @param {string} base url.
   */
function createArrayUrls (base) {
  let fakeArray = Array.from({length:(4)});
  let arrayUrls = [];
  for (var i in fakeArray) {
    let url = `${base + i}`;
    arrayUrls.push(url);
  }
  arrayUrls.shift();
  return arrayUrls;
}

/**
   * Collecting all elements needed from API.
   * @param {json} finalData.
   * @param {string} carousel id of carousel.
   */
function createElementsCarousel (finalData, carousel) {
  const list = [];
  for (var i in finalData) {
    list.push((finalData[i]["results"]));
  }
  list.forEach((item) => {
    item.forEach((item) => {
    let image = document.createElement('img');
    let movieTitle = document.createElement('h4');

    image.src = item["image_url"];
    image.alt = `affiche du film '${item["title"]}'.`;
    image.setAttribute("class", "forModal");
    image.setAttribute('id', (item["id"]));
    movieTitle.innerHTML = `"${item["title"]}"`;

    let content = document.createElement('div');
    let body = document.createElement('div');
    body.setAttribute('class', 'carousel__item-body');
    image.setAttribute('id', (item["id"]));
    content.setAttribute('class', "carousel__img-format");
    content.appendChild(image);
    body.appendChild(movieTitle);
    content.appendChild(body);
    document.querySelector(carousel).appendChild(content);
    });
  });
}

/**
   * Modals : Create an "onclick" event on movie's images.
   */
async function displayModals() {

  var modal = document.getElementById("myModal");
  var span = document.getElementsByClassName("modal__close");
  span[0].addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target != modal) {
      modal.style.display = "none";
    }
  }); 

  const allImg = document.querySelectorAll(".forModal");
  
  allImg.forEach(element => {
    element.addEventListener('click', async () => {
      const id = element.id;
      await createElementsModals(id);
      modal.style.display = "block";
      });
  });
}

/**
   * Collecting all information for modals from API.
   * @param {number}  id of the movie.
   */
async function createElementsModals(id) {
    const url = `http://localhost:8000/api/v1/titles/${id}`;
    const response = await fetch(url);
    const data = await response.json();
    let div = document.querySelector('.modal__content');

    if (document.querySelector('#img-movie') != null) {
      let toRemove = (document.querySelector('#img-movie'));
      toRemove.remove();

      let image = document.createElement('img');
      image.setAttribute('id', 'img-movie');
      image.src = data["image_url"];
      image.alt = `affiche du film '${data["title"]}'.`;
      div.appendChild(image);
    } else if (document.querySelector('#img-movie') === null) {
      let image = document.createElement('img');
      image.setAttribute('id', 'img-movie');
      image.src = data["image_url"];
      image.alt = `affiche du film '${data["title"]}'.`;
      div.appendChild(image);
    }

    innerCheck(data, "title", "Titre : ", div);
    innerCheck(data, "genres", "Genre(s) : ", div);
    innerCheck(data, "date_published", "Date de sortie : ", div);
    innerCheck(data, "rated", "Rated : ", div);
    innerCheck(data, "imdb_score", "Score Imdb : ", div);
    innerCheck(data, "directors", "Réalisateur(s) : ", div);
    innerCheck(data, "actors", "Acteur(s) : ", div);
    innerCheck(data, "duration", "Durée : ", div);
    innerCheck(data, "countries", "Pays d'origine : ", div);
    innerCheck(data, "worldwide_gross_income", "Résultat au Box Office : ", div);
    innerCheck(data, "long_description", "", div);
    
}

/**
   * Checking if data === null.
   * @param {json} data.
   * @param {string}  element.
   * @param {string}  title.
   */
function innerCheck (data, element, title, div) {
  
  if (document.querySelector(`#${element}`) != null) {
    let toRemove = (document.querySelector(`#${element}`));
    toRemove.remove();

    let text = document.createElement('h3');
    text.setAttribute('id', element);

    if (data[element] === null) {
      text.innerHTML = `${title}Valeur manquante.`;
      div.appendChild(text);
    } else if (data[element] != null) {
      text.innerHTML = `${title}${data[element]}.`;
      div.appendChild(text);
    };
  } else if (document.querySelector(`#${element}`) === null){
    let text = document.createElement('h3');
    text.setAttribute('id', element);

    if (data[element] === null) {
      text.innerHTML = `${title}Valeur manquante.`;
      div.appendChild(text);
    } else if (data[element] != null) {
      text.innerHTML = `${title}${data[element]}.`;
      div.appendChild(text);
    }
  }
}
/**
   * Create carousels with options. OPTIONS FOR USER.
   * @param {string} carousel id of carousel.
   */
function newInstanceCarousel(carousel) {
  new Carousel(document.querySelector(carousel), {
    slidesToScroll: 1,
    slidesVisible: 3,
  });
}

/**
   * Main function for body.
   */
async function main () {
  await createHeader('http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page=1');
  await displayCarousel('http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page=', '#carousel1');
  await displayCarousel('http://localhost:8000/api/v1/titles/?genre=drama&page=', '#carousel2');
  await displayCarousel('http://localhost:8000/api/v1/titles/?genre=romance&page=', '#carousel3');
  await displayCarousel('http://localhost:8000/api/v1/titles/?genre=comedy&page=', '#carousel4');
  await displayModals();

}

window.addEventListener('DOMContentLoaded', main);
