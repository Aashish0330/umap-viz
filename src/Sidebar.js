import React, { Component } from 'react';
import './index.css';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLassoSelectActive: false,
      isZoomActive: true,
    };
    this.handleLassoSelect = this.handleLassoSelect.bind(this);
    this.handleZoomToggle = this.handleZoomToggle.bind(this);
  }

  componentDidMount() {
    this.props.setSidebarCanvas(this.side_canvas);
    this.handleSelectAlgorithm = this.handleSelectAlgorithm.bind(this);
  }

  handleSelectAlgorithm(e) {
    let v = e.target.value;
    this.props.selectAlgorithm(v);
  }

  handleLassoSelect() {
    this.setState({
      isLassoSelectActive: true,
      isZoomActive: false,
    }, () => {
      this.props.handleZoomToggle(false);
    });
  }

  handleZoomToggle() {
    this.setState(prevState => ({
      isLassoSelectActive: false,
      isZoomActive: !prevState.isZoomActive,
    }), () => {
      this.props.handleZoomToggle(this.state.isZoomActive);
    });
  }

  render() {
    let {
      sidebar_orientation,
      sidebar_image_size,
      grem,
      p,
      hover_index,
      mnist_labels,
      color_array,
      algorithm_options,
      algorithm_choice,
    } = this.props;

    const { isLassoSelectActive, isZoomActive } = this.state;

    return (
      <div className="sidebar-container">
        <div>
          <div className="sidebar-header">
            <div>Algorithm:</div>
            <select
              onChange={this.handleSelectAlgorithm}
              value={algorithm_options[algorithm_choice]}
            >
              {algorithm_options.map((option, index) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div
            className="sidebar-content"
            style={{
              flexDirection:
                sidebar_orientation === 'horizontal' ? 'row' : 'column',
            }}
          >
            <div>
              <canvas
                className="sidebar-canvas"
                ref={side_canvas => {
                  this.side_canvas = side_canvas;
                }}
                width={sidebar_image_size}
                height={sidebar_image_size}
              />
            </div>
            <div className="sidebar-info">
              <div
                className={`sidebar-label ${
                  hover_index ? 'sidebar-label-active' : ''
                }`}
                style={{
                  background: hover_index
                    ? `rgb(${color_array[mnist_labels[hover_index]].join(',')})`
                    : 'transparent',
                }}
              >
                <div>Label:</div>
                {hover_index ? <div>{mnist_labels[hover_index]}</div> : null}
              </div>
              <div className="sidebar-index">
                Index:
                {hover_index ? <div>{hover_index}</div> : null}
              </div>
            </div>
          </div>
        </div>
        <div className="sidebar-buttons">
        </div>
      </div>
    );
  }
}

export default Sidebar;
