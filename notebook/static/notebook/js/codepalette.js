// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    'jquery',
    'typeahead',
    'base/js/i18n',
    'notebook/js/quickhelp'
],function($, typeahead, i18n, QH){
    "use strict";

    var CodePalette = function(notebook) {
        if(!notebook){
          throw new Error("CodePalette takes a notebook non-null mandatory argument");
        }

        // typeahead lib need a specific layout with specific class names.
        // the following just does that
        var form = $('<form/>');
        var container = $('<div/>').addClass('typeahead__container');
        var field = $('<div/>').addClass('typeahead__field');
        var input = $('<input/>').attr('type', 'search');

        field
          .append(
            $('<span>').addClass('typeahead__query').append(
              input
            )
          )
          .append(
            $('<span/>').addClass('typeahead__button').append(
              $('<button/>').attr('type', 'submit').append(
                $('<span/>').addClass('typeahead__search-icon')
              )
            )
          );

        container.append(field);
        form.append(container);

        var mod = $('<div/>').addClass('modal code-palette').append(
          $('<div/>').addClass('modal-dialog')
          .append(
            $('<div/>').addClass('modal-content').append(
              $('<div/>').addClass('modal-body')
              .append(
                form
              )
            )
          )
        )
        // end setting up right layout
        .modal({show: false, backdrop:true})
        .on('shown.bs.modal', function () {
              // click on button trigger de-focus on mouse up.
              // or something like that.
              setTimeout(function(){input.focus();}, 100);
        });

        notebook.keyboard_manager.disable();

        var before_close = function() {
          // little trick to trigger early in onsubmit
          // when the action called pop-up a dialog
          // insure this function is only called once
          if (before_close.ok) {
            return;
          }
          var cell = notebook.get_selected_cell();
          if (cell) {
            cell.select();
          }
          if (notebook.keyboard_manager) {
            notebook.keyboard_manager.enable();
            notebook.keyboard_manager.command_mode();
          }
          before_close.ok = true; // avoid double call.
        };
        
        mod.on("hide.bs.modal", before_close);
        
        // will be trigger when user select action
        var onSubmit = function(node, query, result, resultCount) {
          switch(result.key) {
            case 'load_dataset':
              notebook.load_dataset();
              break;
            case 'save_dataset':
              notebook.save_dataset();
              break;
            case 'load_model':
              notebook.load_model();
              break;
            case 'save_model':
              notebook.save_model();
              break;
            default:
              console.warn("No command " + result.key);
          }
          mod.modal('hide');
        };

        /* 
         * Whenever a result is rendered, if there is only one resulting
         * element then automatically select that element.
         */
        var onResult = function(node, query, result, resultCount) {
            if (resultCount == 1) {
                requestAnimationFrame(function() {
                    $('.typeahead-list > li:nth-child(2)').addClass('active');
                });
            }
        };

        // generate structure needed for typeahead layout and ability to search
        var src = {
          'Minio' :  {
            data: [
              {
                display: 'Load dataset',
                key: 'load_dataset'
              },
              {
                display: 'Save dataset',
                key: 'save_dataset'
              },
              {
                display: 'Load model',
                key: 'load_model'
              },
              {
                display: 'Save model',
                key: 'save_model'
              },
            ]
          }
        };
         
        // now src is the right structure for typeahead
        input.typeahead({
          emptyTemplate: function(query) {
            return $('<div>').text("No results found for ").append(
                $('<code>').text(query)
            );
          },
          maxItem: 1e3,
          minLength: 0,
          hint: true,
          group: {
            template:"{{group}} group"
          },
          searchOnFocus: true,
          mustSelectItem: true,
          template: '<i class="fa fa-icon {{icon}}"></i>{{display}}  <div title={{key}} class="pull-right"></div>',
          order: "asc",
          source: src,
          callback: {
            onSubmit: onSubmit,
            onClickAfter: onSubmit,
            onResult: onResult
          },
          debug: false,
        });

        mod.modal('show');
    };
    return {'CodePalette': CodePalette};
});
