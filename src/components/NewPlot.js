import React, { Component } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as _ from 'lodash';
import * as d3 from 'd3';

class NewPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedEmbeddings: null,
    };
  }

  // Initialize the plot (similar to Projection.js)
  init() {
    const { width, height } = this.props;

    this.scene = new THREE.Scene();

    let vFOV = 75;
    let aspect = width / height;
    let near = 0.01;
    let far = 1000;

    this.camera = new THREE.PerspectiveCamera(vFOV, aspect, near, far);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x111111, 1);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    this.addPoints();
    this.setUpCamera();
    this.animate();
  }

  // Add points to the scene
  addPoints() {
    const { selectedEmbeddings } = this.state;
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(selectedEmbeddings.length * 3);

    // Fill position array
    selectedEmbeddings.forEach((embedding, index) => {
      positions[index * 3] = embedding[0];
      positions[index * 3 + 1] = embedding[1];
      positions[index * 3 + 2] = 0; // z coordinate is 0
    });

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    this.scene.add(points);
  }

  setUpCamera() {
    let { width, height } = this.props;

    let aspect = this.camera.aspect;
    let vFOV = this.camera.fov;
    let rvFOV = THREE.Math.degToRad(vFOV);

    let max_x = _.max(this.state.selectedEmbeddings.map(e => e[0]));
    let min_x = _.min(this.state.selectedEmbeddings.map(e => e[0]));
    let max_y = _.max(this.state.selectedEmbeddings.map(e => e[1]));
    let min_y = _.min(this.state.selectedEmbeddings.map(e => e[1]));

    let data_width = max_x - min_x;
    let data_height = max_y - min_y;
    let data_aspect = data_width / data_height;

    let max_center = Math.max(Math.abs(min_x), Math.abs(max_x), Math.abs(min_y), Math.abs(max_y));

    let camera_z_start = max_center / Math.tan(rvFOV / 2);
    this.camera.position.z = camera_z_start * 1.1;
    this.camera.updateProjectionMatrix();
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.renderer.render(this.scene, this.camera);
  };

  componentDidMount() {
    // Retrieve the selected embeddings from localStorage
    const selectedEmbeddings = JSON.parse(localStorage.getItem('selectedEmbeddings'));

    if (selectedEmbeddings) {
      this.setState({ selectedEmbeddings }, () => {
        this.init(); // Initialize the plot after setting the state
      });
    } else {
      console.error('No selected embeddings found in localStorage');
    }
  }

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }} ref={mount => (this.mount = mount)}>
        {/* This will be the WebGL canvas for the t-SNE plot */}
      </div>
    );
  }
}

export default NewPlot;
