define([
  'angular',
  'text!./cam-sorting-choices.html'
], function(
  angular,
  template
) {
  'use strict';

  return [function() {
    return {
      link: function(scope, element, attrs) {
        scope.order = attrs.order;//scope.order || 'asc';

        scope.by = attrs.by;//scope.by || 'priority';

        scope.changeOrder = function() {
          scope.order = scope.order === 'asc' ? 'desc' : 'asc';
          scope.$emit('sorting.order.change', scope.order);
        };

        scope.changeBy = function(by) {
          scope.by = by;
          scope.$emit('sorting.by.change', by);
          element.find('.dropdown.open').removeClass('open');
        };

        function setSortingLabel() {
          scope.byLabel = element.find('[sort-by="'+ scope.by +'"]').text();
        }

        scope.$watch('by', setSortingLabel);

        scope.$watch('order', setSortingLabel);

        setSortingLabel();
      },
      template: template
    };
  }];
});
