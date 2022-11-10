const API_URL ='http://localhost:3024/'

let dataMusic = [];

let playlist = [];

const favouriteList = localStorage.getItem('favourite') ? JSON.parse(localStorage.getItem('favourite')) : [];

const audio = new Audio();



const headerLogo = document.querySelector('.header__logo');
const tracksCard = document.getElementsByClassName('track');
const favouriteBtn = document.querySelector('.header__favourite-btn');
const catalogContainer = document.querySelector('.catalog__container');
const player = document.querySelector('.player');
const trackTitle = document.querySelector('.track-info__title');
const trackArtist = document.querySelector('.track-info__artist');
const pauseBtn = document.querySelector('.player__controller-pause');
const stopBtn = document.querySelector('.player__controller-stop');
const prevBtn = document.querySelector('.player__controller-prev');
const nextBtn = document.querySelector('.player__controller-next');
const likeBtn = document.querySelector('.player__controller-like');
const muteBtn = document.querySelector('.player__controller-mute');
const playerVolumeInput = document.querySelector('.player__volume-input');
const playerProgressInput = document.querySelector('.player__progress-input');
const playerTimePassed = document.querySelector('.player__time-passed');
const playerTimeTotal = document.querySelector('.player__time-total');
const search = document.querySelector('.search');


const catalogAddBtn = document.createElement('button');
catalogAddBtn.classList.add('catalog__btn-add');
catalogAddBtn.innerHTML = `<span>Увидеть все</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        
                            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"  />
                        
                    </svg>`;


const pausePlayer = () => {
const trackActive = document.querySelector('.track_active')


     if (audio.paused) {
        audio.play();
         pauseBtn.classList.remove('player__icon_play');
         trackActive.classList.remove('track_pause');
    } else {
        audio.pause();
         pauseBtn.classList.add('player__icon_play');
         trackActive.classList.add('track_pause');
    }
}


const playMusic = (event) => {
    event.preventDefault();
    const trackActive = event.currentTarget;

    if (trackActive.classList.contains('track_active')) {
        pausePlayer();
        return;
    }

  let i = 0;
  const id = trackActive.dataset.idTrack;
  
const index = favouriteList.indexOf(id)
    if (index !== -1) {
      likeBtn.classList.add('player__icon_like_active')
      
    } else {
      likeBtn.classList.remove('player__icon_like_active')
      
    }

  const track = playlist.find((item, index) => {
    i = index;
    return  id === item.id
    } ) 
    
  audio.src = `${API_URL}${track.mp3}`;
  trackTitle.textContent = track.track;
  trackArtist.textContent = track.artist;
    audio.play();
    pauseBtn.classList.remove('player__icon_play');
  player.classList.add('player_active');
  player.dataset.idTrack = id;

  
  const prevTrack = i === 0 ? playlist.length - 1 : i - 1;
  const nextTrack = i + 1 === playlist.length ? 0 : i + 1;
  prevBtn.dataset.idTrack = playlist[prevTrack].id;
  nextBtn.dataset.idTrack = playlist[nextTrack].id;
  likeBtn.dataset.idTrack = id;

  for (let i = 0; i < tracksCard.length; i++){
    if (id === tracksCard[i].dataset.idTrack) {
        tracksCard[i].classList.add('track_active');
    } else {
      tracksCard[i].classList.remove('track_active');
      }
        
    }

    
}



const addHandlerTrack = () => {
    for (let i = 0; i < tracksCard.length; i++) {
    tracksCard[i].addEventListener('click', playMusic);
    
};
};





const createCard = (data) => {
    const card = document.createElement('a');
    card.href = '#';
  card.className = 'catalog__item track';
  if (player.dataset.idTrack === data.id) {
    card.classList.add('track_active');
    if (audio.paused) {
      card.classList.add('track_pause');
    }
  }
  
    card.dataset.idTrack = data.id;

    card.innerHTML = `<div class="track__img-wrap"><img  class="track__poster" src="${API_URL}${data.poster}" alt="${data.artist} ${data.track}" width="180" height="180">
                    </div>
                    <div class="track__info track-info">
                        <p class="track-info__title">${data.track}</p>
                        <p class="track-info__artist">${data.artist}</p>
                    </div>`;
    
    return card;
};

const renderCatalog = (dataList) => {
  playlist = [...dataList];
  catalogContainer.textContent = '';
  const listCards = dataList.map(createCard);
  catalogContainer.append(...listCards);
  addHandlerTrack();
};

const checkCount = (i = 1) => {
  tracksCard[0];
  if (catalogContainer.clientHeight > tracksCard[0].clientHeight * 3) {
    tracksCard[tracksCard.length - i].style.display = 'none';
    checkCount(i + 1);
  } else if (i !== 1) {
      catalogContainer.append(catalogAddBtn);
    }

};

const updateTime = () => {
  // console.log(audio.currentTime);
  // console.log(audio.duration);
  const duration = audio.duration;
  const currentTime = audio.currentTime;
  const progress = (currentTime / duration) * 100;
  playerProgressInput.value = progress ? progress : 0;

  const minutesPassed = Math.floor(currentTime / 60) || '0';
  const secondsPassed = Math.floor(currentTime % 60) || '0';
  
  const minutesDuration = Math.floor(duration / 60) || '0';
  const secondsDuration = Math.floor(duration % 60) || '0';
  
  playerTimePassed.textContent = `${minutesPassed}:${secondsPassed < 10 ? '0' + secondsPassed : secondsPassed}`;
  playerTimeTotal.textContent = `${minutesDuration}:${secondsDuration < 10 ? '0' + secondsDuration : secondsDuration}`;
}

const init = async() => {
  audio.volume = localStorage.getItem('volume') || 1;
  playerVolumeInput.value = audio.volume * 100;

dataMusic = await fetch(`${API_URL}api/music`).then((data) => data.json())

  renderCatalog(dataMusic);
  checkCount();

  catalogAddBtn.addEventListener('click', () => {
    [...tracksCard].forEach((trackCard) => {
      trackCard.style.display = '';
      catalogAddBtn.remove();
    })
  })
  prevBtn.addEventListener('click', playMusic);
  nextBtn.addEventListener('click', playMusic);


  // Создаем сами событие которое произойдет на некст батон, и вызовет плей мюзик. баблс -всплытие
  audio.addEventListener('ended', () => {
    nextBtn.dispatchEvent(new Event('click', { bubbles: true }))
  })

  audio.addEventListener('timeupdate', updateTime);
  playerProgressInput.addEventListener('change', () => {
    const progress = playerProgressInput.value;
    // console.log('progress', progress);
    audio.currentTime = (progress / 100) * audio.duration;

  });

  favouriteBtn.addEventListener('click', () => {
    const data = dataMusic.filter((item) => favouriteList.includes(item.id))
    renderCatalog(data);
    checkCount();
  })

  
  headerLogo.addEventListener('click', () => {
    renderCatalog(dataMusic);
    checkCount();
  })

  likeBtn.addEventListener('click', () => {
    const index = favouriteList.indexOf(likeBtn.dataset.idTrack)
    if (index === -1) {
      likeBtn.classList.add('player__icon_like_active')
      favouriteList.push(likeBtn.dataset.idTrack)
    } else {
      likeBtn.classList.remove('player__icon_like_active')
      favouriteList.splice(index, 1)
    }

    localStorage.setItem('favourite', JSON.stringify(favouriteList))
  });

  playerVolumeInput.addEventListener('input', () => {
    const value = playerVolumeInput.value;
    audio.volume = value / 100;
})

  muteBtn.addEventListener('click', () => {
    if (audio.volume) {
      localStorage.setItem('volume', audio.volume);
      audio.volume = 0;
      muteBtn.classList.add('player__icon_mute-off');
      playerVolumeInput.value = 0;
    } else {
      audio.volume = localStorage.getItem('volume');
      muteBtn.classList.remove('player__icon_mute-off');
      playerVolumeInput.value = audio.volume * 100;

    }
  });

 

  pauseBtn.addEventListener('click', pausePlayer);

stopBtn.addEventListener('click', () => {
  audio.src = '';
  player.classList.remove('player_active');
  document.querySelector('.track_active').classList.remove('track_active');

// отключить активную карту

    // if (audio.played) {
    //     audio.pause();
    //     player.classList.remove('player_active');
    //     // audio.src = trackActive.dataset.track;
    // }
    // return;
});
  
   search.addEventListener('submit', async event => {
    event.preventDefault();
    playlist = await fetch(`${API_URL}api/music?search=${search.search.value}`).then((data) => data.json())

    renderCatalog(playlist);
    checkCount();
  });

};

init();




// const pauseMusic = (event) => {

//     const trackActive = event.currentTarget;
    
//     audio.src = trackActive.dataset.track;
//     if (audio.played) {
//  audio.pause();
//         tracksCard.classList.add('track_pause');
//     }
    
       
    
// }

// for (let i = 0; i < tracksCard.length; i++){
//     tracksCard[i].addEventListener('click', pauseMusic);
    
// };

