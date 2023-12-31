import React, { Component } from 'react';
import { AppContainer, Message } from './App.styled';
import Searchbar from './Searchbar';
import ImageGallery from './ImageGallery';
import Button from './Button';
import Loader from './Loader';
import Modal from './Modal';
import { fetchImagesFromServer, IMAGES_PER_PAGE } from '../services/api';

class App extends Component {
  state = {
    searchQuery: '',
    images: [],
    currentPage: 1,
    totalHits: 0,
    isLoading: false,
    showModal: false,
    selectedImage: '',
    selectedTags: '',
    searchQueryError: false,
    noResultsError: false,
    errorFetchingImages: false,
    loaderHeight: '100vh',
    isInitialLoad: true,
  };

  componentDidMount() {
    this.setState({ isInitialLoad: false });
  }

  componentDidUpdate(_, prevState) {
    if (
      prevState.searchQuery !== this.state.searchQuery ||
      prevState.currentPage !== this.state.currentPage
    ) {
      this.fetchImages();
    }
  }

  handleSearchSubmit = e => {
    e.preventDefault();
    const searchQuery = e.target.elements.searchQuery.value.trim();
    if (searchQuery === '') {
      this.setState({
        images: [],
        currentPage: 1,
        totalHits: 0,
        searchQueryError: true,
        noResultsError: false,
      });
    } else {
      this.setState({
        images: [],
        currentPage: 1,
        totalHits: 0,
        searchQuery,
        searchQueryError: false,
        noResultsError: false,
        loaderHeight: '100vh',
      });
    }
  };

  fetchImages = async () => {
    const { searchQuery, currentPage } = this.state;
    try {
      this.setState({ isLoading: true });
      const response = await fetchImagesFromServer(searchQuery, currentPage);
      if (response.hits.length === 0) {
        this.setState({ noResultsError: true });
      } else {
        this.setState(prevState => ({
          images: [...prevState.images, ...response.hits],
          totalHits: response.totalHits,
        }));
      }
    } catch (error) {
      this.setState({ errorFetchingImages: true });
      console.log('Error fetching images:', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleLoadMore = () => {
    this.setState(prevState => ({
      currentPage: prevState.currentPage + 1,
      isLoading: true,
    }));
    this.setState({ loaderHeight: '5vh' });
  };

  handleImageClick = (imageUrl, imageTags) => {
    this.setState({
      selectedImage: imageUrl,
      selectedTags: imageTags,
      showModal: true,
    });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false, selectedImage: '', selectedTags: '' });
  };

  render() {
    const {
      images,
      isLoading,
      showModal,
      selectedImage,
      selectedTags,
      searchQueryError,
      noResultsError,
      errorFetchingImages,
      currentPage,
      totalHits,
      loaderHeight,
      isInitialLoad,
    } = this.state;

    const showLoadMoreButton =
      currentPage < Math.ceil(totalHits / IMAGES_PER_PAGE);
    const isLastPage = !showLoadMoreButton && currentPage !== 1;

    return (
      <AppContainer>
        <Searchbar onSubmit={this.handleSearchSubmit} isLoading={isLoading} />
        {!isInitialLoad && (
          <>
            {searchQueryError && <Message>Please enter a search term</Message>}
            {noResultsError && <Message>No results found</Message>}
            {errorFetchingImages && <Message>Error fetching images</Message>}
            {images.length > 0 && (
              <ImageGallery
                images={images}
                onImageClick={this.handleImageClick}
              />
            )}
            {isLoading && <Loader height={loaderHeight} />}
            {showLoadMoreButton && !isLoading && (
              <Button onLoadMore={this.handleLoadMore} />
            )}
            {isLastPage && <Message>Reached the last page of images</Message>}
            {showModal && (
              <Modal
                imageUrl={selectedImage}
                imageTags={selectedTags}
                onCloseModal={this.handleCloseModal}
              />
            )}
          </>
        )}
      </AppContainer>
    );
  }
}

export default App;