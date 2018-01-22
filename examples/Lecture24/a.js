'use strict';
/**
 * @private
 * @ngdoc service
 * @module atModelOptionsComponents
 * @name RiskModelGridCtrl
 *
 * @description
 * Controller for the risk model factor grid
 */
class RiskModelGridCtrl {
  constructor($element, $scope, CRMFactorsManager, FactorsListUtils, atFactorEnums,
              atRiskModelFactorUtils, atCRMConsts, tfGridExpansionState, tfGridSelectionState, RiskModelGridService, riskModelDragDrop) {
    this.FactorsListUtils = FactorsListUtils;
    this.CRMFactorsManager = CRMFactorsManager;
    this.atFactorEnums = atFactorEnums;
    this.atRiskModelFactorUtils = atRiskModelFactorUtils;
    this.atCRMConsts = atCRMConsts;
    this.tfGridSelectionState = tfGridSelectionState;
    this.RiskModelGridService = RiskModelGridService;
    this.riskModelDragDrop = riskModelDragDrop;
    this.rows = [];
    this.viewSettings = this.viewSettings || {};
    if (!this.viewSettings.crmExpansionState) {
      this.viewSettings.crmExpansionState = tfGridExpansionState.expandAll();
    }
    this.flattenedFactors = this.CRMFactorsManager.getFlattenedFactors(this.factorListManager);
    this.columns = [
      { id: 'factorName', label: 'Name'},
      { id: 'type', label: 'Factor Type'},
      { id: 'transformation', label: 'Transformation'},
    ];
    this.columnState = {
      constraints: {
        factorName: {
          min: 100,
        },
        type: {
          min: 50,
        },
        transformation: {
          min: 100,
        },
      },
    };
    this.gridHeight = 400;
    this.gridWidth = 1;
    const dimsSub = Rx.Observable.interval(100)
      .map(() => ({
        width: $element[0].offsetWidth,
      })).distinctUntilChanged(_.isEqual)
      .subscribe((dims) => {
        // use an $apply here because RxJS operates outside the angular digest system.
        $scope.$apply(() => {
          this.gridWidth = dims.width;
          //Until the user resizes the columns, this variable is empty.
          //We need to know the width of the Name column to be able to
          //align the steps' remove buttons to the factors' ones.
          this.resizableColState = {
            columns: {
              factorName: this.gridWidth / this.columns.length,
            },
          };
        });
      });
    $scope.$on('$destroy', () => {
      dimsSub.unsubscribe();
    });
    //ToDo: SeparateIncomaptibleTypes, see http://opengrok.factset.com/source/xref/p4/online/makefds/mainline/at3_riskmodel_factor_slctn_wdg.cxx#102
    //Old risk models may have currency factors mixed in with endogenous factors, which they shouldn't be
    $scope.$watch(
      () => this.riskModelInputSettings.factors,
      (newValue) => {
        if (newValue) {
          this.CRMFactorsManager.annotateFactors(this.modelInputs);
          this._generateRowsFromAnnotatedFactors(newValue);
          //Set the tab error state
          this.riskModelInputSettings.validateEditTab();
        }
      }, true);
  }
  _generateRowsFromAnnotatedFactors(annotatedFactors) {
    this.rows = [];
    _.forEach(annotatedFactors, (step) => {
      const node = {
        label: step.label,
        factorId: step.id,
        error: step.error,
        type: '',
        group: true,
      };
      const children = [];
      _.forEach(step.nodes, (factor) => {
        let factorName;
        if (!this.factorListManager.get(factor.factor)) {
          if (this.atRiskModelFactorUtils.isPcaFactor(factor.factor)) {
            factorName = this.atCRMConsts.pcaFactorName;
          }
        } else {
          factorName = this.factorListManager.get(factor.factor).name;
        }
        const child = {
          factorName: factorName,
          factorId: factor.factor,
          type: this.atRiskModelFactorUtils.getRankingTypeDescription(factor.normalization),
          transformation: this.atFactorEnums.toName('eRankingType', factor.normalization),
          numBlindFactor: factor.numBlindFactor,
        };
        this._factorError(factor.factor, factorName, child);
        children.push(child);
      });
      node.children = children;
      //Since a step is only allowed to have one type of factor, we can use any factor to determine the step type
      if (!_.isEmpty(children)) {
        node.type = children[0].type;
        node.label = node.label;
      }
      this.rows.push(node);
    });
  }
  /**
   * @ngdoc method
   * @module atModelOptionsComponents
   * @name RiskModelGridCtrl#updateSelection
   *
   * @description
   * Called by thief grid when the user tries to change selection. Prevents the user from selecting both factors and
   * steps at the same time.
   *
   * @param {SelectionState} state The state of the grid after the user tried to changed it
   */
  updateSelection(state) {
    // Sees if an id exists at the top level. If it does we can assume it is a step because factors will always be
    // within a step.
    function getType(itemId, rows) {
      return _.find(rows, {factorId: itemId}) ? 'step' : 'factor';
    }
    const selectedFactorIds = this.tfGridSelectionState.toIds(state);
    if (selectedFactorIds.length === 1) {
      this.RiskModelGridService.selectedFactorIds = selectedFactorIds;
      this.RiskModelGridService.factorsSelectionModel = state;
      return;
    }
    const previouslySelectedIds = this.tfGridSelectionState.toIds(
      this.RiskModelGridService.factorsSelectionModel);
    const previouslySelectedType = getType(previouslySelectedIds[0], this.rows);
    // Thief grid splits up the selected items into multiple buckets so they can make ctrl-click and select-click both
    // work. If we just use their `fromIds` function all of the selected items end up in the first bucket which makes
    // shift-click act like ctrl-click. Thus we loop over each of the buckets to make sure that we leave the each item
    // in the correct bucket.
    _.each(state.stack, (items, index) => {
      const filteredStack = _.filter(_.keys(items), (id) => getType(id, this.rows) === previouslySelectedType);
      let newStack = {};
      _.each(filteredStack, (id) => {
        newStack[id] = true;
      });
      state.stack[index] = newStack;
    });
    this.RiskModelGridService.selectedFactorIds = this.tfGridSelectionState.toIds(state);
    this.RiskModelGridService.factorsSelectionModel = state;
  }
  removeFactors(rowId) {
    this.CRMFactorsManager.removeFactors(this.riskModelInputSettings.factors,
                                         this.RiskModelGridService.selectedFactorIds,
                                         rowId);
    //Clear selection
    this.RiskModelGridService.clearSelection();
    this.riskModelInputSettings.validateEditTab();
  }
  removeSteps(rowId) {
    this.CRMFactorsManager.removeSteps(this.riskModelInputSettings.factors,
                                       this.RiskModelGridService.selectedFactorIds,
                                       rowId);
    //Clear selection
    this.RiskModelGridService.clearSelection();
    this.riskModelInputSettings.validateEditTab();
  }
  /**
   * @ngdoc method
   * @module atModelOptionsComponents
   * @name RiskModelGridCtrl#drop
   *
   * @description
   * Called when the user drops an item. Updates the factors accordingly.
   *
   * @param {SelectionState} selectionState The thief grid selection state of what is currently selected
   * @param {Object} dropRow The thief grid row that is being dropped before / after / on
   * @param {String} dropPosition The drop position we should be testing for the drop row. Will be one of 'into',
   * before, or 'after'.
   */
  drop(selectionState, dropRow, dropPosition) {
    const draggedItemIds = this.tfGridSelectionState.toIds(selectionState);
    const dropItemId = dropRow.id;
    // If we are dropping a factor after an expanded step we need to change the position from `after` to `into` so that
    // the factor gets put into the step and not after it
    if (dropPosition !== 'into' && !this.CRMFactorsManager.isStep(
          this.CRMFactorsManager.getItem(draggedItemIds[0], this.riskModelInputSettings.factors)) &&
        this.CRMFactorsManager.isStep(
          this.CRMFactorsManager.getItem(dropItemId, this.riskModelInputSettings.factors))) {
      if (this.riskModelDragDrop.isExpanded(dropItemId, this.viewSettings.crmExpansionState)) {
        dropPosition = 'into';
      } else {
        return;
      }
    }
    this.riskModelDragDrop.move(draggedItemIds, dropItemId, dropPosition, this.viewSettings.crmExpansionState,
                                this.riskModelInputSettings.factors);
  }
  /**
   * @ngdoc method
   * @module atModelOptionsComponents
   * @name RiskModelGridCtrl#canDrag
   *
   * @description
   * Called by an ng-if on the tfDrag element for every row in the thief grid.
   *
   * @param {Object} dragRow The thief grid row that is being tested
   *
   * @returns {Boolean} True if the row should be draggable and false if it should not be
   */
  canDrag(dragRow) {
    // TODO: This is a workaround for thief-grid bug that is fixed in version 0.7.1:
    // https://gitlab.factset.com/thief/angular-grid/issues/26
    if (!dragRow.data) {
      return false;
    }
    const dragItem = this.CRMFactorsManager.getItem(dragRow.id, this.riskModelInputSettings.factors);
    if (!dragItem) {
      return false;
    }
    // Do not allow the user to drag the pca step or factor
    if (this.CRMFactorsManager.isPcaStep(dragItem) || this.CRMFactorsManager.isPcaFactor(dragItem)) {
      return false;
    }
    return true;
  }
  /**
   * @ngdoc method
   * @module atModelOptionsComponents
   * @name RiskModelGridCtrl#canDrop
   *
   * @description
   * Called by tfDrop on each row in the thief grid with each possible type of drop location for the item that is
   * currently being dragged.
   *
   * @param {SelectionState} selectionState The thief grid selection state of what is currently selected
   * @param {Object} dragRow The thief grid row that is being tested to see if we can drop before / after / on it
   * @param {String} dropPosition The drop position we should be testing for the drop row. Will be one of 'into',
   * before, or 'after'.
   *
   * @returns {Boolean} True if the row being dragged should be able to dropped on the given row in given position.
   */
  canDrop(selectionState, dropRow, dropPosition) {
    const draggedItemIds = this.tfGridSelectionState.toIds(selectionState);
    const dropItemId = dropRow.id;
    return this.riskModelDragDrop.canDrop(draggedItemIds, dropItemId, dropPosition, this.viewSettings.crmExpansionState,
                                          this.riskModelInputSettings.factors);
  }
  persistExpansionState(newVal) {
    this.viewSettings.crmExpansionState = newVal;
  }
  //Extends the passed-in node object if there's an error
  _factorError(factorId, factorName, node) {
    if (!this.riskModelInputSettings.validateFactor(factorId)) {
      const errorElem = { error: {
        name: 'Factor', message: 'This factor has been deleted', },
      };
      _.extend(node, errorElem);
    }
  }
}
angular.module('atModelOptionsComponents')
.controller('RiskModelGridCtrl', RiskModelGridCtrl);