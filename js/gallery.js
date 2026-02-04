"use strict";

(() => {
  const { createElement: e, useState, useEffect } = React;

  const invariant = Object.freeze({
    withinBounds: Object.freeze((value, begin, end) => {
      if (value < begin || value > end) {
        throw new Error(
          "value out of bounds, valid bounds are from " + begin + " to " + end,
        );
      }
    }),
    validNumbers: Object.freeze((...numbers) => {
      if (!numbers.every(Number.isFinite)) {
        throw new Error("received value that is not a finite number");
      }
    }),
  });

  // I use the top layer index because the first element, as the top
  // layer, does not move. All others move to the right of it. So when
  // the second element is the top layer, it has index one and moves one
  // time by that offset to free the space on the left.
  //
  // I need to calculate the top layer's index because the movement of
  // every layer starts from the center of the current top layer.
  // Therefore I need to move an element to the position of the top
  // layer. After that, I can calculate how much I need to move the
  // element.
  const calculateTopLayerOffset = ({
    topLayerIndex,
    offset,
    initialOffset,
  }) => {
    invariant.validNumbers(topLayerIndex, offset, initialOffset);

    return topLayerIndex * offset + initialOffset;
  };

  // I need direction to know if a layer has to move left or right
  // because the CSS translate function takes a positive or a negative
  // percentage to show that.
  //
  // I need the top layer's size because I need to know how much to move
  // the current layer to the edge of the top layer.
  //
  // I need the size of the current layer so I can calculate how much
  // space is missing to reach the left or right edge.
  //
  // I need an order because I need to know the order of my current layer
  // relative to the top layer. That is because I need to know how much
  // to move the layer to show a part of it.
  //  - The first hidden layer behind the top layer moves once to the
  //    edge of the top layer and once more to become visible.
  //  - The second hidden layer behind the first hidden layer has to
  //    move once to the edge of the top layer and once to the right to
  //    reach the edge of the first hidden layer. The second time to
  //    show a part of it.
  //
  // An offset is how much of the current layer is visible behind the
  // layer above it.
  //
  // The initial offset is the initial space around the top layer. It is
  // an initial offset of every movement.
  const calculateSizeToMoveInDirection = ({
    direction,
    topLayerSize,
    size,
    order,
    offset,
    initialOffset,
  }) => {
    invariant.validNumbers(
      direction,
      topLayerSize,
      size,
      order,
      offset,
      initialOffset,
    );

    // I need to calculate how much to move the element to the edge
    // because when the layer is smaller than the top one, and I want
    // to show a part of it, I have to reach the edge of the top layer.
    const sizeToBothEdges = topLayerSize - size;
    const sizeToOneEdge = sizeToBothEdges / 2;
    const moveToShowByOrder = order * offset;
    const moveToShow = sizeToOneEdge + moveToShowByOrder + initialOffset;

    return direction * moveToShow;
  };

  function generateLayers({ topLayerIndex, initialOffset }) {
    topLayerIndex = ((topLayerIndex % 7) + 7) % 7;

    invariant.validNumbers(initialOffset);

    // The arrays of properties in an ordered sequence in the direction
    // of each half to calculate the layer's properties.
    // Each layer gets smaller.
    const size = [100, 80, 70, 60, 50, 40, 30];
    // Each layer gets smaller, but use this value for the CSS scale
    // property. I don't want to divide the size by 100 to get the
    // value for the CSS scale property.
    const scale = [1, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
    const order = [0, 1, 2, 3, 4, 5, 6];
    // The first element does not move. It is in the correct position
    // with zero offsets.
    const right = [0, 1, 1, 1, 1, 1, 1];
    // The first element does not move. It is in the correct position
    // with zero offsets.
    const left = [0, -1, -1, -1, -1, -1, -1];
    // Every subsequent element is behind the previous one.
    const zIndex = [7, 6, 5, 4, 3, 2, 1];

    const assign = ({ orderBy, direction }) => ({
      size: size[orderBy],
      scale: scale[orderBy],
      order: order[orderBy],
      direction: direction[orderBy],
      zIndex: zIndex[orderBy],
    });

    const layers = new Array(7);

    // Assign properties to one-half.
    let i = topLayerIndex;
    let orderBy = 0;
    while (i >= 0) {
      layers[i] = assign({ orderBy, direction: left });
      ++orderBy;
      --i;
    }

    // Assign properties to one-half.
    i = topLayerIndex;
    orderBy = 0;
    while (i <= 6) {
      layers[i] = assign({ orderBy, direction: right });
      ++orderBy;
      ++i;
    }

    // Provide pictures for every layer so I can easily access them in
    // the current layer.
    const pictures = [
      {
        src: "https://media.githubusercontent.com/media/SenpaiV1/foryou/refs/heads/main/her/1.png",
        alt: "pretty.",
        caption: "““You have bewitched me, body and soul, and I love… I love… I love you.”",
      },
      {
        src: "https://media.githubusercontent.com/media/SenpaiV1/foryou/refs/heads/main/her/2.png",
        alt: "cute",
        caption: "“I cannot live without my soul, and my soul is you.”",
      },
      {
        src: "https://media.githubusercontent.com/media/SenpaiV1/foryou/refs/heads/main/her/3.png",
        alt: "gorgeous",
        caption: "“I love you without knowing how, or when, or from where.”",
      },
      {
        src: "https://media.githubusercontent.com/media/SenpaiV1/foryou/refs/heads/main/her/4.png",
        alt: "beautiful",
        caption: "“My heart is ever at your service.”",
      },
      {
        src: "https://media.githubusercontent.com/media/SenpaiV1/foryou/refs/heads/main/her/5.png",
        alt: "outstanding",
        caption: "“I crave your mouth, your voice, your hair.”",
      },
      {
        src: "https://media.githubusercontent.com/media/SenpaiV1/foryou/refs/heads/main/her/6.png",
        alt: "lovely",
        caption: "“I would risk everything for your smile, for your happiness, for you.”",
      },
      {
        src: "https://media.githubusercontent.com/media/SenpaiV1/foryou/refs/heads/main/her/US.png",
        alt: "us",
        caption:
          "“Whatever our souls are made of, his and mine are the same.” — Emily Brontë",
      },
    ];

    i = 0;
    while (i != 7) {
      // Use this index instead of the one when mapping the layers for
      // consistency, not rely on the array index.
      layers[i].index = i;
      layers[i].picture = pictures[i];
      // Provide the values I need for the formula to access them from
      // the current layer.
      layers[i].topLayerIndex = topLayerIndex;
      layers[i].topLayerSize = 100;
      layers[i].offset = 10;
      layers[i].initialOffset = initialOffset;
      ++i;
    }

    return layers;
  }

  function PictureLayers(props) {
    const [layers, setLayers] = useState(
      generateLayers({
        topLayerIndex: props.topLayerIndex,
        initialOffset: props.initialOffset,
      }),
    );
    const [currentTopLayerIndex, setCurrentTopLayerIndex] = useState(
      props.topLayerIndex,
    );

    function setTopLayer({ topLayerIndex, initialOffset }) {
      return () => {
        setLayers(generateLayers({ topLayerIndex, initialOffset }));
        setCurrentTopLayerIndex(topLayerIndex);
        if (window.playTrack) {
          window.playTrack(topLayerIndex);
        }
      };
    }

    // Initialize current picture index
    window.currentPictureIndex = 0;

    // Global function to set the top layer index
    window.setTopLayerIndex = (index) => {
      const normalizedIndex = ((index % 7) + 7) % 7; // Ensure index is within 0-6
      setCurrentTopLayerIndex(normalizedIndex);
      setLayers(
        generateLayers({
          topLayerIndex: normalizedIndex,
          initialOffset: props.initialOffset,
        }),
      );
      window.currentPictureIndex = normalizedIndex;
    };

    const thisHeightScalerFitPicturesWell = 1.5;
    return e(
      "article",
      {
        style: {
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        },
      },
      e("div", { style: { padding: "5px" } }),
      e(
        "section",
        null,
        e("div", { style: { padding: "5px" } }),
        e(
          "ul",
          {
            style: {
              width: props.containerWidth,
              height: thisHeightScalerFitPicturesWell * props.width,
              position: "relative",
              margin: "auto",
            },
          },
          layers.map((layer) => {
            return e(
              "li",
              {
                key: layer.index,
                style: {
                  zIndex: layer.zIndex,
                  width: props.width,
                  position: "absolute",
                  transition: "transform 0.8s ease-in-out",
                  transform: `translateX(${calculateTopLayerOffset({
                    topLayerIndex: layer.topLayerIndex,
                    offset: layer.offset,
                    initialOffset: layer.initialOffset,
                  })}%)`,
                  listStyle: "none",
                },
              },

              e(
                "div",
                {
                  style: {
                    position: "absolute",
                    width: props.width,
                    transition: "transform 0.8s ease-in-out",
                    transform: `translateX(${calculateSizeToMoveInDirection({
                      direction: layer.direction,
                      topLayerSize: layer.topLayerSize,
                      size: layer.size,
                      order: layer.order,
                      offset: layer.offset,
                      initialOffset: layer.initialOffset,
                    })}%)`,
                  },
                },

                // INSTAX BUTTON FRAME
                e(
                  "button",
                  {
                    className: "shadow-on-hover",
                    style: {
                      width: props.width,
                      height: props.width * thisHeightScalerFitPicturesWell,
                      transform: `scale(${layer.scale})`,
                      transition: "transform 0.8s ease-in-out",
                      padding: 0,
                      border: 0,
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    },
                    onClick: setTopLayer({
                      topLayerIndex: layer.index,
                      initialOffset: layer.initialOffset,
                    }),
                  },

                  // PHOTO
                  e("img", {
                    style: {
                      width: "85%",
                      height: "85%",
                      marginTop: "5%",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                      objectFit: "cover",
                      borderRadius: "6px",
                    },
                    src: layer.picture.src,
                    alt: layer.picture.alt,
                  }),

                  // CAPTION
                  e(
                    "div",
                    {
                      style: {
                        fontFamily: "Georgia, serif",
                        fontSize: "12px",
                        fontStyle: "italic",
                        textAlign: "center",
                        color: "#333",
                        position: "absolute",
                        bottom: "20px",
                        left: "0",
                        width: "100%",
                        padding: "0 5px",
                        whiteSpace: "normal",
                        overflow: "visible",
                      },
                    },
                    layer.picture.caption,
                  ),
                ),
              ),
            );
          }),
        ),
      ),
      e(
        "section",
        null,
        e("div", { style: { padding: "5px" } }),
        e(
          "ul",
          {
            style: {
              paddingTop: "20px",
              listStyle: "none",
              display: "flex",
            },
          },
          layers.map((layer, index) => {
            return e("li", {
              key: layer.index,
              "aria-current": layer.topLayerIndex === index
            }
          );
          })
        ),
      ),
      e(
        "div",
        {
          style: {
            paddingTop: "20px",
            display: "flex",
          },
        },

        e("div", { style: { width: "20px" } }),
      ),
    );
  }

  function getWidthForContainerToFillUpLargerPortionOfTheScreen() {
    const reduceBecauseContainerMultipliesWidth = 4;
    return window.innerWidth / reduceBecauseContainerMultipliesWidth;
  }

  function getWidthForContainerToFillUpLargerPortionOfTheScreen() {
    const reduceBecauseContainerMultipliesWidth = 4;
    return window.innerWidth / reduceBecauseContainerMultipliesWidth;
  }

  function CreatePictureLayers() {
    const [width, setWidth] = useState(
      getWidthForContainerToFillUpLargerPortionOfTheScreen(),
    );

    useEffect(() => {
      function updateWidthBecauseWeControlWidthFromJavaScript() {
        window.addEventListener("resize", () => {
          setWidth(getWidthForContainerToFillUpLargerPortionOfTheScreen());
        });
      }

      updateWidthBecauseWeControlWidthFromJavaScript();
    }, [setWidth]);

    const first = 0;

    return e(
      "main",
      null,
      e("div", { style: { textAlign: "center" } }, e("h1", null, "Gallery")),
      e("div", { style: { padding: "10px" } }),
      e(PictureLayers, {
        width,
        // Seven layers, the first one takes 100%, and six other layers
        // take 10% each for their visible parts. When the top layer is
        // the second one, we have an initial offset to the left and
        // right. Therefore we have 160% initially and two 80% offsets,
        // so 320% of width in total.
        containerWidth: 3.2 * width,
        topLayerIndex: first,
        initialOffset: 80,
      }),
    );
  }

  ReactDOM.createRoot(document.querySelector("#root")).render(
    e(React.StrictMode, null, e(CreatePictureLayers)),
  );
})();
