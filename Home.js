import React from 'react';
import { Tabs, Button, Spin } from 'antd';
import { GEO_OPTIONS, TOKEN_KEY, POS_KEY, API_ROOT, AUTH_HEADER } from '../constants';
import { Gallery } from './Gallery';

const TabPane = Tabs.TabPane;

const operations = <Button>Extra Action</Button>;

export class Home extends React.Component {
    state = {
        isLoadingGeoLocation: false,
        error: '',
        isLoadingPosts: false,
        posts: []
    }

    componentDidMount() {
        if ("geolocation" in navigator) {
            this.setState({
                isLoadingGeoLocation: true
            });
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS
            );
        } else {
            this.setState({
                error: 'Geolocation in not supported.'
            });
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({
            lon: longitude,
            lat: latitude
        }));
        this.setState({
            isLoadingGeoLocation: false
        });
        this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = () => {
        this.setState({
            isLoadingGeoLocation: false,
            error: 'Failed to get user location.'
        });
    }

    loadNearbyPosts = () => {
        const {lat, lon} = JSON.parse(localStorage.getItem(POS_KEY));
        const token = localStorage.getItem(TOKEN_KEY);

        this.setState({
            isLoadingPosts: true
        });

        fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20000`, {
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`
            }
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to load posts.');
        })
        .then((data) => {
            console.log(data);
            this.setState({
                isLoadingPosts: false,
                posts: data ? data : []
            });
        })
        .catch((e) => {
            this.setState({
                isLoadingPosts: false,
                error: e.message
            })
        });
    }

    getImagePosts = () => {
        const { error, posts, isLoadingGeoLocation, isLoadingPosts } = this.state;

        if (error) {
            return error;
        } else if (isLoadingGeoLocation) {
            return <Spin tip="Loading geo location..." />;
        } else if (isLoadingPosts) {
            return <Spin tip="Loading posts..." />;
        } else if (posts && posts.length > 0) {
            const images = posts.map(({user, url, message}) => ({
                user,
                src: url,
                thumbnail: url,
                caption: message,
                thumbnailWidth: 400,
                thumbnailHeight: 300
            }));

            return <Gallery images={images} />;
        } else {
            return 'No nearby posts.';
        }
    }

    render() {
        return (
            <Tabs className="main-tabs" tabBarExtraContent={operations}>
                <TabPane tab="Image Posts" key="1">
                    {this.getImagePosts()}
                </TabPane>
                <TabPane tab="Video Posts" key="2">Content of tab 2</TabPane>
                <TabPane tab="Map" key="3">Content of tab 3</TabPane>
            </Tabs>
        );
    }
}