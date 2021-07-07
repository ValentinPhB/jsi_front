
class Carousel {

  /**
   *  This callback type is called  `moveCallback` and is displayed as a global symbol.
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
    this.element = element
    this.options = Object.assign({}, {
      slidesToScroll: 1,
      slidesVisible: 1,
      loop: false
    }, options)
    let children = [].slice.call(element.children)
    this.isMobile = false
    this.movesCallbacks = []
    this.currentItem = 0

    // Edit DOM
    this.root = this.createDivWithClass('carousel')
    this.container = this.createDivWithClass('carousel__container')
    this.root.setAttribute('tabIndex','0')      
    this.root.appendChild(this.container)
    this.element.appendChild(this.root)
    this.items = children.map((child)  => {
      let item = this.createDivWithClass('carousel__item')
      item.appendChild(child)
      this.container.appendChild(item)
      return item
    })
    this.setStyle()
    this.createNavigation()

    // Event
    this.movesCallbacks.forEach(cb => cb(0))
    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize.bind(this))
    this.root.addEventListener('keyup', e => {
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        this.next()
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        this.prev()
      }

    })
  }

  /**
   * @param {string} className 
   * @returns {HTMLElement}
   */
  createDivWithClass (className) {
    let div = document.createElement('div')
    div.setAttribute('class', className)
    return div
  }

  /**
   * Apply the correct size to all items of the carousel.
   */
  setStyle () {
    let ratio = this.items.length / this.slidesVisible
    this.container.style.width = (ratio * 100) + "%"
    this.items.forEach(item  => item.style.width = ((100 / this.slidesVisible ) / ratio) + '%' )

  }
  /**
   * 
   */
  createNavigation () {
    let nextButton = this.createDivWithClass('carousel__next')
    let prevButton = this.createDivWithClass('carousel__prev')
    this.root.appendChild(nextButton)
    this.root.appendChild(prevButton)
    nextButton.addEventListener('click', this.next.bind(this) )
    prevButton.addEventListener('click', this.prev.bind(this) )
    if (this.options.loop === true) {
      return

    }
    this.onMove(index => {
      if (index === 0) {
        prevButton.classList.add('carousel__prev--hidden')
      } else {
        prevButton.classList.remove('carousel__prev--hidden')
      } 
      if (this.items[this.currentItem + this.slidesVisible] === undefined) {
        nextButton.classList.add('carousel__next--hidden')
      } else {
        nextButton.classList.remove('carousel__next--hidden')
      }
    })
  }

  next() {
    if ((this.currentItem + this.slidesToScroll) <= this.items.length) {
      this.goToItem(this.currentItem + this.slidesToScroll)
    } else if ((this.currentItem + this.slidesToScroll) > this.items.length) {
      this.goToItem(this.currentItem + 1)
    }
  }

  prev() {
    if ((this.currentItem - this.slidesToScroll) < 0) {
      this.goToItem(this.currentItem - 1)
    } else if ((this.currentItem - this.slidesToScroll) >= 0) {
      this.goToItem(this.currentItem - this.slidesToScroll)
    }
  }

  /**
   * Move the carousel to chosen element.
   */
  goToItem (index) {
    if (index < 0 ) {
      if (this.options.loop) {
      index = this.items.length - this.slidesVisible
    } else {
      return
      }
    } else if (index >= this.items.length || (this.items[this.currentItem + this.slidesVisible] === undefined && 
      index > this.currentItem)) {
        if (this.options.loop) {
          index = 0
    } else {
      return
      }
    }
    let translateX = index * -100 / this.items.length
    this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)'
    this.currentItem = index
    this.movesCallbacks.forEach(cb => cb(index))
  }

  /**
   * @param {moveCallback} cb
   */
  onMove (cb) {
    this.movesCallbacks.push(cb)
  }

  /**
   * 
   */
  onWindowResize () {
    let mobile = window.innerWidth < 800
    if (mobile !== this.isMobile) {
      this.isMobile = mobile
      this.setStyle()
      this.movesCallbacks.forEach(cb => cb(this.currentItem))
    }
  }

  /**
   * returns {number} For responsive design
   */
  get slidesToScroll () {
    return this.isMobile ? 1 : this.options.slidesToScroll
  }

  /**
   * returns {number} For responsive design
   */
  get slidesVisible () {
    return this.isMobile ? 1 : this.options.slidesVisible
  }
}

function elementCarousel (base, carousel) {
  let number = 1;
  let url = `${base + number}`;
    fetch(url)
        .then(response => response.json())
        .then(data => { 
        const list = data["results"];
        list.forEach((item, index) => {
        let image = document.createElement('img');
        let movieTitle = document.createElement('h4');

        image.src = list[index]["image_url"];
        movieTitle.innerHTML = `"${list[index]["title"]}"`;

        let content = document.createElement('div');
        let body = document.createElement('div');
        body.setAttribute('class', 'item_body');
        content.setAttribute('id', (list[index]["id"]));
        content.setAttribute('class', "img_format");
        content.appendChild(image);
        body.appendChild(movieTitle);
        content.appendChild(body);
        document.querySelector(carousel).appendChild(content);
    })
    new Carousel(document.querySelector(carousel), {
    slidesToScroll: 2,
    slidesVisible: 3,
  });
  });
}


window.addEventListener('load', elementCarousel('http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page=', '#carousel1'))
window.addEventListener('load', elementCarousel('http://localhost:8000/api/v1/titles/?genre=horror&page=', '#carousel2'))