/* global Flash */
/* global CommentsStore */

import Vue from 'vue';
import '../../vue_shared/vue_resource_interceptor';

window.gl = window.gl || {};

class ResolveServiceClass {
  constructor(root) {
    this.noteResource = Vue.resource(`${root}/notes{/noteId}/resolve`);
    this.discussionResource = Vue.resource(`${root}/merge_requests{/mergeRequestId}/discussions{/discussionId}/resolve`);
  }

  resolve(noteId) {
    return this.noteResource.save({ noteId }, {});
  }

  unresolve(noteId) {
    return this.noteResource.delete({ noteId }, {});
  }

  toggleResolveForDiscussion(mergeRequestId, discussionId) {
    const discussion = CommentsStore.state[discussionId];
    const isResolved = discussion.isResolved();
    let promise;

    if (isResolved) {
      promise = this.unResolveAll(mergeRequestId, discussionId);
    } else {
      promise = this.resolveAll(mergeRequestId, discussionId);
    }

    promise
      .then(resp => resp.json())
      .then((data) => {
        discussion.loading = false;
        const resolvedBy = data ? data.resolved_by : null;

        if (isResolved) {
          discussion.unResolveAllNotes();
        } else {
          discussion.resolveAllNotes(resolvedBy);
        }

        gl.mrWidget.checkStatus();
        discussion.updateHeadline(data);
      })
      .catch(() => new Flash('An error occurred when trying to resolve a discussion. Please try again.'));
  }

  resolveAll(mergeRequestId, discussionId) {
    const discussion = CommentsStore.state[discussionId];

    discussion.loading = true;

    return this.discussionResource.save({
      mergeRequestId,
      discussionId,
    }, {});
  }

  unResolveAll(mergeRequestId, discussionId) {
    const discussion = CommentsStore.state[discussionId];

    discussion.loading = true;

    return this.discussionResource.delete({
      mergeRequestId,
      discussionId,
    }, {});
  }
}

gl.DiffNotesResolveServiceClass = ResolveServiceClass;
