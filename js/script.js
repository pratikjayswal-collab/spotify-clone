console.log('Lets write javascript');
let currentSong = new Audio();
let songs;
let currFolder;

//seconds to minutes covert function from chatgpt
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
// function that replace all occurance as replaceALL function isn't working
function replaceAllOccurrences(str, find, replace) {
    return str.split(find).join(replace);
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < anchors.length; index++) {
        const element = anchors[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${replaceAllOccurrences(song, "%20", " ")}</div>
                                <div>${replaceAllOccurrences(folder.split("/")[1], "%20", " ")}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        }
        )
    })

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array=Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e= array[index];
            
        
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]

            //Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
                            <div class="play">
                            <svg width="70" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green background circle -->
                                <circle cx="50" cy="50" r="40" fill="#1ed760"></circle>
                                <!-- Black play button -->
                                <polygon points="40,30 70,50 40,70" fill="black"></polygon>
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p></div>`
        }
    };

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(replaceAllOccurrences(songs[0], "%20", " "))
                document.querySelector(".left").style.left = "0"
            
            
        })
    })

}

async function main() {

    // Get the list of all the songs
    await getSongs("songs/Aashiqui%202")
    playMusic(replaceAllOccurrences(songs[0], "%20", " "), true)

    //Display all the albums on the page
    displayAlbums()

    // Attach an event listener to play pause 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    //Add an event listener to previous 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(replaceAllOccurrences(songs[index - 1], "%20", " "))
        }

    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {

            playMusic(replaceAllOccurrences(songs[index + 1], "%20", " "))
        }

    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume>0) {
            document.querySelector(".volume>img").src = "img/volume.svg"
        } else if(currentSong.volume == 0){
            document.querySelector(".volume>img").src = "img/mute.svg"
        }
    })

    //Add an event to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
      if (e.target.src.includes("img/volume.svg")) {
        e.target.src = "img/mute.svg"
        currentSong.volume= 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      } else {
        e.target.src = "img/volume.svg"
        currentSong.volume= .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
      }

    })

    //Add an event to current song when it's ended
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(replaceAllOccurrences(songs[index + 1], "%20", " "));
        }
    });

}
main()
