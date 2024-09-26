import React, { Component } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as d3 from 'd3';

class NewPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedEmbeddings: null,
    };
  }

  // Initialize the plot
  init() {
    const { width, height } = this.mount.getBoundingClientRect();

    // Create the scene
    this.scene = new THREE.Scene();

    // Set up the camera with a wider field of view to help fit more points
    let vFOV = 35;
    let aspect = width / height;
    let near = 0.01;
    let far = 100;

    this.camera = new THREE.PerspectiveCamera(vFOV, aspect, near, far);

    // Set up the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x111111, 1);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    // Add points and camera settings
    this.addPoints();
    this.setUpCamera();
    this.animate();
  }

  // Scale the embeddings if necessary for better visualization
  scaleEmbeddings(embeddings) {
    const xs = embeddings.map(e => e[0]);
    const ys = embeddings.map(e => e[1]);

    const max_x = Math.max(...xs);
    const max_y = Math.max(...ys);
    const min_x = Math.min(...xs);
    const min_y = Math.min(...ys);

    // Use a linear scale to map embeddings within a visible range
    const scaleX = d3.scaleLinear().domain([min_x, max_x]).range([-50, 50]);
    const scaleY = d3.scaleLinear().domain([min_y, max_y]).range([-50, 50]);

    return embeddings.map(e => [scaleX(e[0]), scaleY(e[1])]);
  }

  // Add points to the scene
  addPoints() {
    const { selectedEmbeddings } = this.state;
    const scaledEmbeddings = this.scaleEmbeddings(selectedEmbeddings);

    const pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(scaledEmbeddings.length * 3);

    // Fill position array with scaled embeddings
    scaledEmbeddings.forEach((embedding, index) => {
      positions[index * 3] = embedding[0];
      positions[index * 3 + 1] = embedding[1];
      positions[index * 3 + 2] = 0; // z coordinate is 0 for 2D embeddings
    });

    pointsGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      size: 1.5, // Increase size for better visibility
      color: 0xffffff,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    this.scene.add(points);
  }

  setUpCamera() {
    const { width, height } = this.mount.getBoundingClientRect();

    let vFOV = this.camera.fov;
    let aspect = this.camera.aspect;
    let rvFOV = THREE.Math.degToRad(vFOV);

    let max_x = Math.max(...this.state.selectedEmbeddings.map(e => e[0]));
    let min_x = Math.min(...this.state.selectedEmbeddings.map(e => e[0]));
    let max_y = Math.max(...this.state.selectedEmbeddings.map(e => e[1]));
    let min_y = Math.min(...this.state.selectedEmbeddings.map(e => e[1]));

    let max_center = Math.max(
      Math.abs(min_x),
      Math.abs(max_x),
      Math.abs(min_y),
      Math.abs(max_y)
    );

    // Adjust the camera's z-position based on the scale of the embeddings
    let camera_z_start = max_center / Math.tan(rvFOV / 2);
    this.camera.position.z = camera_z_start * 1.5; // Adjust camera distance for a better view
    this.camera.updateProjectionMatrix();
  }

  // Animation loop
  animate = () => {
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.renderer.render(this.scene, this.camera);
  };

  handleResize = () => {
    const { width, height } = this.mount.getBoundingClientRect();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
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

    // Handle window resizing
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    return (
      <div
        style={{
          width: 'calc(100vw - 250px)',  // Adjust width to fill most of the screen, leaving space for sidebar
          height: '100vh',               // Set to 100% of the viewport height
          position: 'absolute',
          top: 0,
          right: 0,                       // Ensure it's aligned with the right side of the screen
        }}
        ref={mount => (this.mount = mount)}
      >
        {/* This will be the WebGL canvas for the embeddings plot */}
      </div>
    );
  }
}

export default NewPlot;
