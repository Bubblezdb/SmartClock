const APIController= (function(){

    const clientId= '0c4ad7bdddbf4c8c864cadeab53f8fff';
    const clientSecret='ca57009a7f614c27b20da8c8f9d9380a';

    //private methods for API 
    const _getToken= async () =>{
        const result= await fetch('https://accounts.spotify.com/api/token',{
            method: 'Post',
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization': 'Basic' +btoa(clientId + ':'+clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        const data= await result.json();
        return data.access_token;
    }

    const _getGenres =async (token) => {
        const result= await fetch('https://api.spotify.com/v1/browser/categories?locale=sv_US',{
            method: 'GET',
            headers:{'Authorization': 'Bearer'+token}
        });
        const data= await result.json();
        return data.categories.items;
    }
    const _getPlaylistByGenre =async (token, genreId)=> {
        const limit =10;
        const result =await fetch (`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,{
            method: 'GET',
            headers:{'Authorization': 'Bearer'+token}
        });
        const data = await result.json();
        return data.playlists.items;
    }


    const _getTracks = async (token, tracksEndPoint)=>{
        const limit= 10;
        const result= await fetch(`${tracksEndPoint}?limit=${limit}`,{
            method: 'GET',
            headers:{'Authorization':'Bearer'+token}
        });
        const data= result.json();
        return data.items;
    }
    const _getTrack = async (token, trackEndPoint)=>{
        
        const result= await fetch(`${trackEndPoint}`,{
            method: 'GET',
            headers:{'Authorization':'Bearer'+token}
        });
        const data = result.json();
        return data.items;
    }
    return {
        getToken(){
            return _getToken();
        },
        getGenres(token){
            return _getGenres(token);
        },
        getPlaylistByGenre(token,genreId){
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint){
            return _getTracks(token,  tracksEndPoint);
        },
        getTrack(token, trackEndPoint){
            return _getTrack(token, trackEndPoint);
        }
    }
})();

//UI Module
const UIController = (function(){

    //object to hold references to html selectors
    const DOMElements = {
        selectGenre:'#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit:'#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list' 
    }
    //public methods
    return {

        //This method can be called outside of this module.
        inputField() {
            return{
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                songs: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },
        //method to reset playlist
        createGenre(text,value) {
            const html= `<option value= "${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend',html);//beforeend is the position 

        },
        createPlaylist(text,value){
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend',html);

        },
         
        //need method to create a track list group item
        createTrack(id,name){
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSongDetail).insertAdjacentHTML('beforeend',html);

        },
        createSongDetail(img,title,artist){
            const detailDiv =document.querySelector(DOMElements.divSongDetail);
            // any time user clicks a new song, the song details should clear
            detailDiv.innerHTML ='';
            const html =
            `<div class="row col-sm-12 px-0">]
            <img src="${img}"alt="">
            </div>
            <div class="row col-sm-12 px-0">
                <label for="Genre" class= "form-label col-sm-12">${title}</label>
            </div>
            <div class="row col-sm-12 px-0">
                <label for="Artist" class= "form-label col-sm-12">By ${artist}:</label>
            </div>
            `;

            detailDiv.insertAdjacentHTML('beforeend',html)

        },
        resetTrackDetail(){
            this.inputField().songDetail.innerHTML = '';
        },
        resetTracks(){
            this.inputField().songs.innerHTML='';
            this.resetTrackDetail();
        },
        resetPlaylist(){
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        }
        
    }
})();

//This module is suppose to connect both UI and API
const APPController= (function(UICtrl, APICtrl){

    const DOMInputs= UICtrl.inputField();// fix inputField

    const loadGenres= async() => {
        //get the token
        const token = await APICtrl.getToken();
        //store the token onto the page
        UICtrl.storeToken(token);// troubleshoot******
        //get the genres
        const genres = await APICtrl.getGenres(token);
        //populate the genre select element
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));

    }
    //create genre change event listener
    DOMInputs.genre.addEventListener('change',async()=>{
        UICtrl.resetPlaylist();
        const token=UICtrl.getStoredToken().token;//Troubleshoot*****
        const genreSelect= UICtrl.inputField().genre;
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;
        const playlist=await APICtrl.getPlaylistByGenre(token,genreId);
        console.log(playlist)

    });

    //create playlist change event listener
    DOMInputs.submit.addEventListener('click', async (e)=>{
        e.preventDefault();
        UICtrl.resetTracks();
        //get token
        const token= UICtrl.getStoredToken().token;
        //get the playlist field
        const playlistSelect = UICtrl.inputField().playlist;
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        //get the tracks from the api
        const tracks = await APICtrl.getTracks(token,tracksEndPoint);
        tracks.forEach(t=>UICtrl.createTrack(t.track.href, t.track.name));
    });

    //create song selection click event listener
    DOMInputs.songs.addEventListener('click',async (e)=>{
        e.preventDefault();
        UICtrl.resetTrackDetail();
        const token = UICtrl.getStoredToken().token;
        const trackEndPoint= e.target.id;
        const track = await APICtrl.getTrack(token,trackEndPoint);
        UICtrl.createTrackDetail(track.album.images[2].url,track.name,track.artist[0].name);
    });

    return{
        init(){
            console.log('App is starting');
            loadGenres();
        }
    }


})(UIController,APIController);

//will need to call a method to load the genres on page load
APPController.init();