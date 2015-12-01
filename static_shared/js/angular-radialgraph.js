(function (angular) {

  // Modules
  angular.module('angularRadialgraph.directives', [
    'angularRadialgraph.directives.radialGraph'
  ]);
  angular.module('angularRadialgraph', [
    'angularRadialgraph.directives'
  ]);

})(angular);

(function (angular) {
  'use strict';

  angular.module('angularRadialgraph.directives.radialGraph', [])

  /**
   * This component draws  radial graphs for a given
   * normalized value (0-100) as a SVG element.
   *
   * Highly inspired by D3 Radial Component
   * http://www.brightpointinc.com/clients/brightpointinc.com/library/radialProgress/index.html
   *
   * Result could be customized extending the .fs-radial-graph class.
   *
   * How to use:
   *
   *   <div radial-graph
   *        data-value="widget.percentualValue"
   *        data-size="120"
   *        data-strokewidth="9">
   *   </div>
   *
   * @param {value}       Linked value to be plotted
   * @param {size}        Width  of the expected square
   * @param {strokewidth} Stroke width. Default value: 9
   *
   */
    .directive('fsRadialGraph', function radialGraph() {

      return {

        replace: false,
        restrict: 'A',
        template:
        '<svg class=" animated bounce" ng-class="class">' +
        '  <circle />' +
        '  <path class="{{pathClass}}"/>'+
        '</svg>',
        scope: {
          value: '=',
          size: '@',
          strokeWidth: '@strokewidth',
          class : '@'
        },

        link: function (scope, element) {
          //Normalize input value to get start arc position
          var strokeWidth = scope.strokeWidth || 9,
            radius = (scope.size / 2),
            effectiveRadius = radius - Math.ceil(strokeWidth / 2) - 1,
            svgCircle = element[0].getElementsByTagName('circle')[0],
            svgPath = element[0].getElementsByTagName('path')[0];


          function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return {
              x: centerX + (radius * Math.cos(angleInRadians)),
              y: centerY + (radius * Math.sin(angleInRadians))
            };
          }

          function describeArc(x, y, radius, startAngle, endAngle) {
            //Simple hack to draw full circles with just one arc
            startAngle = startAngle !== 0 ? startAngle : 0.01;
            var start = polarToCartesian(x, y, radius, endAngle),
              end = polarToCartesian(x, y, radius, startAngle),
              arcSweep = endAngle - startAngle <= 180 ? '0' : '1',
              d = [
                'M', start.x, start.y,
                'A', radius, radius, 0, arcSweep, 0, end.x, end.y
              ].join(' ') + (startAngle === 0.01 ? ' Z' : '');
            return d;
          }

          scope.radius = radius;
          scope.effectiveRadius = effectiveRadius;

          element.width = scope.size;
          element.height = scope.size;
          svgCircle.setAttributeNS(null, 'cx', radius);
          svgCircle.setAttributeNS(null, 'cy', radius);
          svgCircle.setAttributeNS(null, 'r', effectiveRadius);
          svgCircle.style.strokeWidth = strokeWidth;
          svgPath.style.strokeWidth = strokeWidth;

          scope.$watch('value', function () {
            var startArcPosition = scope.value >= 100 ? 0 : ((100 - scope.value) * 360) / 100;
            scope.pathClass = startArcPosition > 0 ? 'incomplete' : 'complete';
            svgPath.setAttributeNS(null, 'd', describeArc(radius, radius, effectiveRadius, startArcPosition, 360));
          });

        }

      };

    });

}(angular));
